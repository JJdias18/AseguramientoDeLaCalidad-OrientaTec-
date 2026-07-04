require('dotenv').config();

const request = require('supertest');

describe('CORS', () => {
  const originalClientOrigin = process.env.CLIENT_ORIGIN;

  afterEach(() => {
    process.env.CLIENT_ORIGIN = originalClientOrigin;
    jest.resetModules();
  });

  it('permite el origen configurado en CLIENT_ORIGIN en una petición normal', async () => {
    process.env.CLIENT_ORIGIN = 'http://localhost:5173';
    jest.resetModules();
    // eslint-disable-next-line global-require
    const app = require('../src/app');

    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('responde el preflight (OPTIONS) de una ruta de auth con los headers de CORS', async () => {
    process.env.CLIENT_ORIGIN = 'http://localhost:5173';
    jest.resetModules();
    // eslint-disable-next-line global-require
    const app = require('../src/app');

    const response = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');

    expect([200, 204]).toContain(response.status);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-methods']).toEqual(
      expect.stringContaining('POST')
    );
  });

  it('usa http://localhost:5173 como origen por defecto si CLIENT_ORIGIN no está definida', async () => {
    delete process.env.CLIENT_ORIGIN;
    jest.resetModules();
    // eslint-disable-next-line global-require
    const app = require('../src/app');

    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('no habilita un origen distinto al configurado', async () => {
    process.env.CLIENT_ORIGIN = 'http://localhost:5173';
    jest.resetModules();
    // eslint-disable-next-line global-require
    const app = require('../src/app');

    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://sitio-no-permitido.com');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
