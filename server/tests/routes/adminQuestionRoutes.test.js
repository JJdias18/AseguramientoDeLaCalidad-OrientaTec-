require('dotenv').config();

const request = require('supertest');

const app = require('../../src/app');
const { pool, query } = require('../../src/config/db');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@ejemplo.cr`;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const ADMIN_CREDENTIALS = {
  email: 'admin@orientatec.cr',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin1234',
};

describe('Rutas del banco de reactivos — admin (HU-07)', () => {
  const createdEmails = [];
  const createdQuestionIds = [];
  let adminToken;
  let studentToken;

  beforeAll(async () => {
    const login = await request(app).post('/api/v1/auth/login').send(ADMIN_CREDENTIALS);
    adminToken = login.body.token;

    const email = uniqueEmail();
    createdEmails.push(email);
    const register = await request(app)
      .post('/api/v1/auth/register')
      .send({ fullName: 'Estudiante Prueba', email, password: 'clave1234' });
    studentToken = register.body.token;
  });

  afterAll(async () => {
    if (createdQuestionIds.length > 0) {
      await query('DELETE FROM questions WHERE id = ANY($1::int[])', [createdQuestionIds]);
    }
    if (createdEmails.length > 0) {
      await query('DELETE FROM users WHERE email = ANY($1::text[])', [createdEmails]);
    }
    await pool.end();
  });

  describe('Escenario 4: acceso restringido a estudiantes', () => {
    it('un estudiante recibe 403 en cada endpoint del banco de reactivos', async () => {
      const list = await request(app).get('/api/v1/admin/questions').set(auth(studentToken));
      expect(list.status).toBe(403);
      expect(list.body.error.code).toBe('FORBIDDEN');

      const create = await request(app)
        .post('/api/v1/admin/questions')
        .set(auth(studentToken))
        .send({ text: 'Reactivo intruso', riasecType: 'R' });
      expect(create.status).toBe(403);

      const update = await request(app)
        .put('/api/v1/admin/questions/1')
        .set(auth(studentToken))
        .send({ text: 'Reactivo intruso', riasecType: 'R' });
      expect(update.status).toBe(403);

      const deactivate = await request(app)
        .delete('/api/v1/admin/questions/1')
        .set(auth(studentToken));
      expect(deactivate.status).toBe(403);
    });

    it('exige sesión iniciada (401 sin token)', async () => {
      const response = await request(app).get('/api/v1/admin/questions');
      expect(response.status).toBe(401);
    });
  });

  describe('Escenario 1: crear un reactivo', () => {
    it('el admin crea un reactivo con texto y tipo RIASEC, y aparece en el banco', async () => {
      const response = await request(app)
        .post('/api/v1/admin/questions')
        .set(auth(adminToken))
        .send({
          text: 'Disfruto programar pequeños scripts para automatizar tareas.',
          riasecType: 'I',
        });

      expect(response.status).toBe(201);
      expect(response.body.question).toMatchObject({
        text: 'Disfruto programar pequeños scripts para automatizar tareas.',
        riasecType: 'I',
        isActive: true,
      });
      createdQuestionIds.push(response.body.question.id);

      const list = await request(app).get('/api/v1/admin/questions').set(auth(adminToken));
      expect(list.body.questions.some((q) => q.id === response.body.question.id)).toBe(true);
    });

    it('el reactivo recién creado aparece de inmediato en el cuestionario del estudiante', async () => {
      const create = await request(app)
        .post('/api/v1/admin/questions')
        .set(auth(adminToken))
        .send({ text: 'Me gusta clasificar objetos según reglas claras.', riasecType: 'C' });
      createdQuestionIds.push(create.body.question.id);

      const questions = await request(app).get('/api/v1/questions').set(auth(studentToken));
      expect(questions.body.questions.some((q) => q.id === create.body.question.id)).toBe(true);

      // Se desactiva de inmediato para no alterar el conteo fijo de reactivos activos
      // que verifican los tests de HU-02 (30 = 5 por tipo, decisión #36 de PLAN.md).
      await request(app)
        .delete(`/api/v1/admin/questions/${create.body.question.id}`)
        .set(auth(adminToken));
    });
  });

  describe('Escenario 2: editar un reactivo', () => {
    it('el admin edita el texto y el tipo de un reactivo existente', async () => {
      const create = await request(app)
        .post('/api/v1/admin/questions')
        .set(auth(adminToken))
        .send({ text: 'Texto original del reactivo de prueba.', riasecType: 'S' });
      createdQuestionIds.push(create.body.question.id);

      const update = await request(app)
        .put(`/api/v1/admin/questions/${create.body.question.id}`)
        .set(auth(adminToken))
        .send({ text: 'Texto editado del reactivo de prueba.', riasecType: 'E' });

      expect(update.status).toBe(200);
      expect(update.body.question).toMatchObject({
        id: create.body.question.id,
        text: 'Texto editado del reactivo de prueba.',
        riasecType: 'E',
      });
    });

    it('responde 404 al editar un reactivo inexistente', async () => {
      const response = await request(app)
        .put('/api/v1/admin/questions/999999')
        .set(auth(adminToken))
        .send({ text: 'No existe', riasecType: 'R' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('QUESTION_NOT_FOUND');
    });
  });

  describe('Escenario 3: desactivar (soft delete) un reactivo', () => {
    it('desactiva el reactivo, que deja de servirse en el cuestionario pero se conserva en la BD', async () => {
      const create = await request(app)
        .post('/api/v1/admin/questions')
        .set(auth(adminToken))
        .send({ text: 'Reactivo que se va a desactivar.', riasecType: 'A' });
      const { id } = create.body.question;
      createdQuestionIds.push(id);

      const deactivate = await request(app)
        .delete(`/api/v1/admin/questions/${id}`)
        .set(auth(adminToken));

      expect(deactivate.status).toBe(200);
      expect(deactivate.body.question.isActive).toBe(false);

      // No aparece en el cuestionario del estudiante...
      const questions = await request(app).get('/api/v1/questions').set(auth(studentToken));
      expect(questions.body.questions.some((q) => q.id === id)).toBe(false);

      // ...pero la fila se conserva (nunca DELETE físico: `answers` la referencia).
      const row = await query('SELECT is_active FROM questions WHERE id = $1', [id]);
      expect(row.rows).toHaveLength(1);
      expect(row.rows[0].is_active).toBe(false);
    });

    it('responde 404 al desactivar un reactivo inexistente', async () => {
      const response = await request(app)
        .delete('/api/v1/admin/questions/999999')
        .set(auth(adminToken));

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('QUESTION_NOT_FOUND');
    });
  });

  describe('Escenario 5: validación de campos', () => {
    it('rechaza crear un reactivo sin texto', async () => {
      const response = await request(app)
        .post('/api/v1/admin/questions')
        .set(auth(adminToken))
        .send({ text: '   ', riasecType: 'R' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_QUESTION_TEXT');
    });

    it('rechaza crear un reactivo con un tipo RIASEC inválido', async () => {
      const response = await request(app)
        .post('/api/v1/admin/questions')
        .set(auth(adminToken))
        .send({ text: 'Texto válido, tipo inválido.', riasecType: 'Z' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_RIASEC_TYPE');
    });

    it('rechaza editar un reactivo con texto vacío', async () => {
      const create = await request(app)
        .post('/api/v1/admin/questions')
        .set(auth(adminToken))
        .send({ text: 'Reactivo válido para probar edición inválida.', riasecType: 'R' });
      createdQuestionIds.push(create.body.question.id);

      const update = await request(app)
        .put(`/api/v1/admin/questions/${create.body.question.id}`)
        .set(auth(adminToken))
        .send({ text: '', riasecType: 'R' });

      expect(update.status).toBe(400);
      expect(update.body.error.code).toBe('INVALID_QUESTION_TEXT');
    });
  });
});
