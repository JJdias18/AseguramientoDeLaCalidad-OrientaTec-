require('dotenv').config();

const request = require('supertest');

const app = require('../../src/app');
const { pool, query } = require('../../src/config/db');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@ejemplo.cr`;

/** Registra un estudiante nuevo y devuelve su token JWT. */
const createStudent = async (createdEmails) => {
  const email = uniqueEmail();
  createdEmails.push(email);
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({ fullName: 'Estudiante Prueba', email, password: 'clave1234' });
  return response.body.token;
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

/** Responde los 30 reactivos con un valor por reactivo y envía el cuestionario. */
const completeQuestionnaire = async (token, valueFor) => {
  const start = await request(app).post('/api/v1/attempts').set(auth(token));
  const { attempt, questions } = start.body;
  // Secuencial: refleja el autosave real (una respuesta a la vez).
  // eslint-disable-next-line no-restricted-syntax
  for (const question of questions) {
    // eslint-disable-next-line no-await-in-loop
    await request(app)
      .patch(`/api/v1/attempts/${attempt.id}/answers`)
      .set(auth(token))
      .send({ questionId: question.id, value: valueFor(question) });
  }
  await request(app).post(`/api/v1/attempts/${attempt.id}/submit`).set(auth(token));
};

describe('Rutas de recomendación de áreas (HU-03)', () => {
  const createdEmails = [];

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await query('DELETE FROM users WHERE email = ANY($1::text[])', [createdEmails]);
    }
    await pool.end();
  });

  it('exige sesión iniciada', async () => {
    const response = await request(app).get('/api/v1/recommendations');
    expect(response.status).toBe(401);
  });

  describe('Escenario 1: recibe áreas afines ordenadas con su porcentaje', () => {
    it('devuelve al menos 3 áreas con % de afinidad, en orden descendente', async () => {
      const token = await createStudent(createdEmails);
      await completeQuestionnaire(token, (q) => (q.riasecType === 'I' ? 5 : 3));

      const response = await request(app).get('/api/v1/recommendations').set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.hasProfile).toBe(true);
      expect(response.body.recommendations.length).toBeGreaterThanOrEqual(3);
      response.body.recommendations.forEach((areaRec) => {
        expect(typeof areaRec.name).toBe('string');
        expect(Number.isInteger(areaRec.affinity)).toBe(true);
        expect(areaRec.affinity).toBeGreaterThanOrEqual(0);
        expect(areaRec.affinity).toBeLessThanOrEqual(100);
      });
      const afinidades = response.body.recommendations.map((a) => a.affinity);
      const ordenadas = [...afinidades].sort((a, b) => b - a);
      expect(afinidades).toEqual(ordenadas);
    });
  });

  describe('Escenario 2: sin perfil, la respuesta lleva al cuestionario (no es error de sesión)', () => {
    it('responde 200 con hasProfile=false y sin recomendaciones', async () => {
      const token = await createStudent(createdEmails);

      const response = await request(app).get('/api/v1/recommendations').set(auth(token));

      // No es 401 (sesión válida) ni 500: es un estado esperado que guía al cuestionario.
      expect(response.status).toBe(200);
      expect(response.body.hasProfile).toBe(false);
      expect(response.body.recommendations).toEqual([]);
    });
  });

  describe('Escenario 3: cada área trae una explicación de la afinidad', () => {
    it('cada recomendación incluye una explicación derivada del tipo dominante', async () => {
      const token = await createStudent(createdEmails);
      // Perfil marcadamente investigativo.
      await completeQuestionnaire(token, (q) => (q.riasecType === 'I' ? 5 : 1));

      const response = await request(app).get('/api/v1/recommendations').set(auth(token));

      expect(response.status).toBe(200);
      response.body.recommendations.forEach((areaRec) => {
        expect(typeof areaRec.explanation).toBe('string');
        expect(areaRec.explanation.length).toBeGreaterThan(0);
        expect('RIASEC').toContain(areaRec.dominantType);
      });
    });
  });

  describe('Escenario 4: resultados consistentes en dos consultas', () => {
    it('dos consultas seguidas del mismo perfil devuelven el mismo orden y los mismos %', async () => {
      const token = await createStudent(createdEmails);
      await completeQuestionnaire(token, (q) => (q.riasecType === 'A' ? 5 : 2));

      const primera = await request(app).get('/api/v1/recommendations').set(auth(token));
      const segunda = await request(app).get('/api/v1/recommendations').set(auth(token));

      const resumen = (res) =>
        res.body.recommendations.map((a) => ({ name: a.name, affinity: a.affinity }));

      expect(resumen(primera)).toEqual(resumen(segunda));
    });
  });
});
