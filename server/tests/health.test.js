const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1/health', () => {
  it('responde 200 con status ok', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('responde 404 con formato de error uniforme para rutas inexistentes', async () => {
    const response = await request(app).get('/api/v1/no-existe');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Recurso no encontrado.' },
    });
  });
});
