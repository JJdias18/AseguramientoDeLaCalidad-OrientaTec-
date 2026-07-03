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

/** Responde una lista de reactivos con un valor calculado por reactivo. */
const answerQuestions = async (token, attemptId, questions, valueFor) => {
  // Secuencial para reflejar el autosave real (una respuesta a la vez).
  // eslint-disable-next-line no-restricted-syntax
  for (const question of questions) {
    // eslint-disable-next-line no-await-in-loop
    await request(app)
      .patch(`/api/v1/attempts/${attemptId}/answers`)
      .set(auth(token))
      .send({ questionId: question.id, value: valueFor(question) });
  }
};

describe('Rutas del cuestionario vocacional (HU-02)', () => {
  const createdEmails = [];

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await query('DELETE FROM users WHERE email = ANY($1::text[])', [createdEmails]);
    }
    await pool.end();
  });

  describe('GET /api/v1/questions', () => {
    it('exige sesión iniciada', async () => {
      const response = await request(app).get('/api/v1/questions');
      expect(response.status).toBe(401);
    });

    it('devuelve solo reactivos activos (30 del seed, 5 por tipo)', async () => {
      const token = await createStudent(createdEmails);

      const response = await request(app).get('/api/v1/questions').set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.questions).toHaveLength(30);
      const byType = response.body.questions.reduce((acc, q) => {
        acc[q.riasecType] = (acc[q.riasecType] || 0) + 1;
        return acc;
      }, {});
      expect(byType).toEqual({ R: 5, I: 5, A: 5, S: 5, E: 5, C: 5 });
    });
  });

  describe('Escenario 1: cuestionario completo', () => {
    it('responde los 30 reactivos y al enviar genera el perfil vocacional', async () => {
      const token = await createStudent(createdEmails);
      const start = await request(app).post('/api/v1/attempts').set(auth(token));
      const { attempt, questions } = start.body;
      expect(attempt.status).toBe('in_progress');

      await answerQuestions(token, attempt.id, questions, () => 4);

      const submit = await request(app)
        .post(`/api/v1/attempts/${attempt.id}/submit`)
        .set(auth(token));

      expect(submit.status).toBe(201);
      expect(submit.body.profile.scores).toEqual({
        R: 20,
        I: 20,
        A: 20,
        S: 20,
        E: 20,
        C: 20,
      });
      expect(submit.body.profile.hollandCode).toHaveLength(3);
    });
  });

  describe('Escenario 2: cuestionario incompleto', () => {
    it('bloquea el envío y señala las preguntas faltantes', async () => {
      const token = await createStudent(createdEmails);
      const start = await request(app).post('/api/v1/attempts').set(auth(token));
      const { attempt, questions } = start.body;

      // Deja el último reactivo sin responder.
      await answerQuestions(token, attempt.id, questions.slice(0, 29), () => 3);

      const submit = await request(app)
        .post(`/api/v1/attempts/${attempt.id}/submit`)
        .set(auth(token));

      expect(submit.status).toBe(409);
      expect(submit.body.error.code).toBe('INCOMPLETE_QUESTIONNAIRE');
      expect(submit.body.error.details.missing).toEqual([questions[29].id]);
      expect(submit.body.error.details.missingPositions).toEqual([30]);

      // No se creó ningún perfil.
      const profile = await request(app).get('/api/v1/profile').set(auth(token));
      expect(profile.status).toBe(404);
    });
  });

  describe('Escenario 3: retomar el avance', () => {
    it('respondió 15 de 30 y al volver lo ubica en la pregunta 16 con sus respuestas', async () => {
      const token = await createStudent(createdEmails);
      const start = await request(app).post('/api/v1/attempts').set(auth(token));
      const { attempt, questions } = start.body;

      await answerQuestions(token, attempt.id, questions.slice(0, 15), () => 5);

      // Vuelve a entrar (nueva petición, como tras cerrar sesión).
      const resumed = await request(app).get('/api/v1/attempts/current').set(auth(token));

      expect(resumed.status).toBe(200);
      expect(resumed.body.attempt.id).toBe(attempt.id);
      expect(resumed.body.resumed).toBe(true);
      expect(resumed.body.answers).toHaveLength(15);
      expect(resumed.body.progress.answered).toBe(15);
      // nextIndex 15 (base 0) = pregunta 16 (base 1).
      expect(resumed.body.progress.nextIndex).toBe(15);
      expect(resumed.body.questions[15].position).toBe(16);
      expect(resumed.body.progress.complete).toBe(false);

      // POST /attempts retoma el mismo intento, no crea otro.
      const reopened = await request(app).post('/api/v1/attempts').set(auth(token));
      expect(reopened.body.attempt.id).toBe(attempt.id);
    });

    it('el autosave reemplaza la respuesta anterior del mismo reactivo', async () => {
      const token = await createStudent(createdEmails);
      const start = await request(app).post('/api/v1/attempts').set(auth(token));
      const { attempt, questions } = start.body;
      const first = questions[0];

      await request(app)
        .patch(`/api/v1/attempts/${attempt.id}/answers`)
        .set(auth(token))
        .send({ questionId: first.id, value: 2 });
      const second = await request(app)
        .patch(`/api/v1/attempts/${attempt.id}/answers`)
        .set(auth(token))
        .send({ questionId: first.id, value: 5 });

      expect(second.body.answer.value).toBe(5);
      expect(second.body.progress.answered).toBe(1);
    });
  });

  describe('Escenario 4: cálculo del perfil', () => {
    it('puntajes altos en Investigativo y Artístico destacan esas dos áreas', async () => {
      const token = await createStudent(createdEmails);
      const start = await request(app).post('/api/v1/attempts').set(auth(token));
      const { attempt, questions } = start.body;

      // I y A altos (5), el resto bajo (1).
      await answerQuestions(token, attempt.id, questions, (q) =>
        q.riasecType === 'I' || q.riasecType === 'A' ? 5 : 1
      );

      const submit = await request(app)
        .post(`/api/v1/attempts/${attempt.id}/submit`)
        .set(auth(token));

      expect(submit.status).toBe(201);
      const { profile } = submit.body;
      expect(profile.scores.I).toBe(25);
      expect(profile.scores.A).toBe(25);
      expect(profile.dominant).toEqual(['I', 'A']);
      expect(profile.hollandCode.slice(0, 2)).toBe('IA');

      // El perfil queda persistido y disponible como el más reciente.
      const latest = await request(app).get('/api/v1/profile').set(auth(token));
      expect(latest.status).toBe(200);
      expect(latest.body.profile.hollandCode).toBe(profile.hollandCode);
    });
  });

  describe('Validaciones del intento', () => {
    it('rechaza responder un intento ajeno con 404', async () => {
      const owner = await createStudent(createdEmails);
      const intruder = await createStudent(createdEmails);
      const start = await request(app).post('/api/v1/attempts').set(auth(owner));
      const { attempt, questions } = start.body;

      const response = await request(app)
        .patch(`/api/v1/attempts/${attempt.id}/answers`)
        .set(auth(intruder))
        .send({ questionId: questions[0].id, value: 3 });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('ATTEMPT_NOT_FOUND');
    });

    it('rechaza un valor fuera de la escala 1–5', async () => {
      const token = await createStudent(createdEmails);
      const start = await request(app).post('/api/v1/attempts').set(auth(token));
      const { attempt, questions } = start.body;

      const response = await request(app)
        .patch(`/api/v1/attempts/${attempt.id}/answers`)
        .set(auth(token))
        .send({ questionId: questions[0].id, value: 9 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_ANSWER');
    });

    it('no permite reenviar un intento ya completado', async () => {
      const token = await createStudent(createdEmails);
      const start = await request(app).post('/api/v1/attempts').set(auth(token));
      const { attempt, questions } = start.body;
      await answerQuestions(token, attempt.id, questions, () => 3);
      await request(app).post(`/api/v1/attempts/${attempt.id}/submit`).set(auth(token));

      const again = await request(app)
        .post(`/api/v1/attempts/${attempt.id}/submit`)
        .set(auth(token));

      expect(again.status).toBe(409);
      expect(again.body.error.code).toBe('ATTEMPT_ALREADY_COMPLETED');
    });
  });
});
