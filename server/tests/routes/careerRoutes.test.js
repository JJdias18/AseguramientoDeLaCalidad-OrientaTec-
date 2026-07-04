require('dotenv').config();

const request = require('supertest');

const app = require('../../src/app');
const { pool, query } = require('../../src/config/db');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@ejemplo.cr`;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Rutas del catálogo de carreras (HU-04)', () => {
  const createdEmails = [];
  let token;

  beforeAll(async () => {
    const email = uniqueEmail();
    createdEmails.push(email);
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ fullName: 'Estudiante Prueba', email, password: 'clave1234' });
    token = response.body.token;
  });

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await query('DELETE FROM users WHERE email = ANY($1::text[])', [createdEmails]);
    }
    await pool.end();
  });

  it('exige sesión iniciada', async () => {
    const response = await request(app).get('/api/v1/careers');
    expect(response.status).toBe(401);
  });

  describe('Escenario 1: listar el catálogo', () => {
    it('devuelve al menos 20 carreras con su nombre y área', async () => {
      const response = await request(app).get('/api/v1/careers').set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.careers.length).toBeGreaterThanOrEqual(20);
      response.body.careers.forEach((career) => {
        expect(typeof career.name).toBe('string');
        expect(typeof career.area.name).toBe('string');
        expect('RIASEC').toContain(career.area.dominantType);
      });
    });
  });

  describe('Escenario 2: búsqueda con resultados', () => {
    it('muestra únicamente las carreras cuyo nombre contiene el término', async () => {
      const response = await request(app)
        .get('/api/v1/careers')
        .query({ search: 'Ingeniería' })
        .set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.careers.length).toBeGreaterThan(0);
      response.body.careers.forEach((career) => {
        expect(career.name.toLowerCase()).toContain('ingeniería');
      });
    });

    it('la búsqueda es insensible a mayúsculas y a acentos (ej. "biologia" encuentra "Biología")', async () => {
      const response = await request(app)
        .get('/api/v1/careers')
        .query({ search: 'biologia' })
        .set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.careers.some((career) => career.name === 'Biología')).toBe(true);
    });
  });

  describe('Escenario 3: ficha de la carrera', () => {
    it('muestra su descripción, campo laboral y duración', async () => {
      const lista = await request(app)
        .get('/api/v1/careers')
        .query({ search: 'Biología' })
        .set(auth(token));
      const { id } = lista.body.careers[0];

      const response = await request(app).get(`/api/v1/careers/${id}`).set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.career.name).toBe('Biología');
      expect(typeof response.body.career.description).toBe('string');
      expect(response.body.career.description.length).toBeGreaterThan(0);
      expect(typeof response.body.career.fieldOfWork).toBe('string');
      expect(typeof response.body.career.duration).toBe('string');
    });

    it('responde 404 si la carrera no existe', async () => {
      const response = await request(app).get('/api/v1/careers/999999').set(auth(token));
      expect(response.status).toBe(404);
    });
  });

  describe('Escenario 4: búsqueda sin resultados', () => {
    it('devuelve una lista vacía para un término sin coincidencias', async () => {
      const response = await request(app)
        .get('/api/v1/careers')
        .query({ search: 'panaderia' })
        .set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.careers).toEqual([]);
    });
  });

  describe('Filtro por área', () => {
    it('devuelve únicamente las carreras del área indicada', async () => {
      const areas = await query('SELECT id FROM areas ORDER BY id ASC LIMIT 1');
      const areaId = areas.rows[0].id;

      const response = await request(app)
        .get('/api/v1/careers')
        .query({ area: areaId })
        .set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.careers.length).toBeGreaterThan(0);
      response.body.careers.forEach((career) => expect(career.area.id).toBe(areaId));
    });
  });
});
