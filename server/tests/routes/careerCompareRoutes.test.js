require('dotenv').config();

const request = require('supertest');

const app = require('../../src/app');
const { pool, query } = require('../../src/config/db');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@ejemplo.cr`;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Comparador de carreras (HU-05)', () => {
  const createdEmails = [];
  let token;
  let careerA;
  let careerB;

  beforeAll(async () => {
    const email = uniqueEmail();
    createdEmails.push(email);
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ fullName: 'Estudiante Prueba', email, password: 'clave1234' });
    token = response.body.token;

    const careers = await query('SELECT id FROM careers ORDER BY id ASC LIMIT 2');
    [careerA, careerB] = careers.rows;
  });

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await query('DELETE FROM users WHERE email = ANY($1::text[])', [createdEmails]);
    }
    await pool.end();
  });

  it('exige sesión iniciada', async () => {
    const response = await request(app)
      .get('/api/v1/careers/compare')
      .query({ a: careerA.id, b: careerB.id });
    expect(response.status).toBe(401);
  });

  describe('Escenario 1: comparación válida', () => {
    it('muestra ambas carreras lado a lado con sus atributos', async () => {
      const response = await request(app)
        .get('/api/v1/careers/compare')
        .query({ a: careerA.id, b: careerB.id })
        .set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.careers).toHaveLength(2);
      const [first, second] = response.body.careers;
      expect(first.id).toBe(careerA.id);
      expect(second.id).toBe(careerB.id);
      [first, second].forEach((career) => {
        expect(typeof career.name).toBe('string');
        expect(typeof career.duration).toBe('string');
        expect(typeof career.fieldOfWork).toBe('string');
        expect(typeof career.profileDesc).toBe('string');
        expect(typeof career.area.name).toBe('string');
      });
    });
  });

  describe('Escenario 2: una sola carrera seleccionada', () => {
    it('pide seleccionar una segunda carrera si falta "b"', async () => {
      const response = await request(app)
        .get('/api/v1/careers/compare')
        .query({ a: careerA.id })
        .set(auth(token));

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_CAREER');
      expect(response.body.error.message).toMatch(/segunda carrera/i);
    });

    it('pide seleccionar dos carreras si no se envía ninguna', async () => {
      const response = await request(app).get('/api/v1/careers/compare').set(auth(token));

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_CAREER');
    });
  });

  describe('Escenario 3: misma carrera repetida', () => {
    it('avisa que las carreras deben ser distintas', async () => {
      const response = await request(app)
        .get('/api/v1/careers/compare')
        .query({ a: careerA.id, b: careerA.id })
        .set(auth(token));

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('SAME_CAREER');
      expect(response.body.error.message).toMatch(/misma carrera dos veces/i);
    });
  });

  describe('Escenario 4: cambiar una carrera', () => {
    it('actualiza la comparación al pedirla de nuevo con la nueva carrera', async () => {
      const primera = await request(app)
        .get('/api/v1/careers/compare')
        .query({ a: careerA.id, b: careerB.id })
        .set(auth(token));

      const otraCarrera = await query(
        'SELECT id FROM careers WHERE id NOT IN ($1, $2) ORDER BY id ASC LIMIT 1',
        [careerA.id, careerB.id]
      );
      const careerC = otraCarrera.rows[0];

      const segunda = await request(app)
        .get('/api/v1/careers/compare')
        .query({ a: careerA.id, b: careerC.id })
        .set(auth(token));

      expect(segunda.status).toBe(200);
      expect(segunda.body.careers[1].id).toBe(careerC.id);
      expect(segunda.body.careers[1].id).not.toBe(primera.body.careers[1].id);
    });
  });

  it('responde 404 si alguna carrera no existe', async () => {
    const response = await request(app)
      .get('/api/v1/careers/compare')
      .query({ a: careerA.id, b: 999999 })
      .set(auth(token));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('CAREER_NOT_FOUND');
  });
});
