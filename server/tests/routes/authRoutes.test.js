require('dotenv').config();

const request = require('supertest');

const app = require('../../src/app');
const { pool, query } = require('../../src/config/db');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@ejemplo.cr`;

describe('Rutas de autenticación (HU-01)', () => {
  const createdEmails = [];

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await query('DELETE FROM users WHERE email = ANY($1::text[])', [createdEmails]);
    }
    await pool.end();
  });

  describe('POST /api/v1/auth/register', () => {
    it('escenario 1: registra un usuario nuevo con datos válidos', async () => {
      const email = uniqueEmail();
      createdEmails.push(email);

      const response = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Valeria Mora',
        email,
        password: 'clave1234',
      });

      expect(response.status).toBe(201);
      expect(response.body.user).toMatchObject({
        fullName: 'Valeria Mora',
        email,
        role: 'student',
      });
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(typeof response.body.token).toBe('string');
    });

    it('escenario 2: rechaza el registro con un correo ya usado', async () => {
      const email = uniqueEmail();
      createdEmails.push(email);
      await request(app)
        .post('/api/v1/auth/register')
        .send({ fullName: 'Valeria Mora', email, password: 'clave1234' });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ fullName: 'Otra Persona', email, password: 'clave5678' });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('EMAIL_TAKEN');
    });

    it('escenario 3: rechaza una contraseña débil', async () => {
      const email = uniqueEmail();

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ fullName: 'Valeria Mora', email, password: 'abc' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('WEAK_PASSWORD');
    });

    it('rechaza el registro si faltan campos obligatorios', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: uniqueEmail(), password: 'clave1234' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('escenario 4: inicia sesión con credenciales correctas y devuelve un token', async () => {
      const email = uniqueEmail();
      createdEmails.push(email);
      await request(app)
        .post('/api/v1/auth/register')
        .send({ fullName: 'Valeria Mora', email, password: 'clave1234' });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'clave1234' });

      expect(response.status).toBe(200);
      expect(typeof response.body.token).toBe('string');
      expect(response.body.user).toMatchObject({ email, role: 'student' });
    });

    it('escenario 5: rechaza credenciales incorrectas con mensaje genérico', async () => {
      const email = uniqueEmail();
      createdEmails.push(email);
      await request(app)
        .post('/api/v1/auth/register')
        .send({ fullName: 'Valeria Mora', email, password: 'clave1234' });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'clave-equivocada1' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.error.message).toBe('Correo o contraseña incorrectos.');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('rechaza la petición sin token', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
    });

    it('devuelve los datos del usuario autenticado con un token válido', async () => {
      const email = uniqueEmail();
      createdEmails.push(email);
      await request(app)
        .post('/api/v1/auth/register')
        .send({ fullName: 'Valeria Mora', email, password: 'clave1234' });
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'clave1234' });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({ email, role: 'student' });
    });
  });
});
