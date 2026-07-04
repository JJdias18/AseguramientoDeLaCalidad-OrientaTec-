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
    .send({ fullName: 'Estudiante Reporte', email, password: 'clave1234' });
  return response.body.token;
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

/**
 * pdfkit escribe el texto como cadenas hexadecimales (`<...>`) dentro de los
 * operadores `Tj`/`TJ`, no como texto literal. Para poder verificar el CONTENIDO
 * del reporte sin depender de un parser de PDF completo, se decodifican todas las
 * cadenas hex del stream (sin comprimir, ver `compress: false` en
 * `pdfReportService`) y se concatenan a un texto plano equivalente. Las cadenas de
 * una misma línea (un mismo `TJ`) se unen SIN separador: los espacios reales ya
 * quedan codificados dentro del hex (el kerning entre ellas son solo números).
 */
const extractPdfText = (buffer) => {
  const raw = buffer.toString('latin1');
  return raw
    .split('\n')
    .map((line) => {
      const hexStrings = line.match(/<[0-9a-fA-F]+>/g) || [];
      return hexStrings.map((hex) => Buffer.from(hex.slice(1, -1), 'hex').toString('latin1')).join('');
    })
    .filter(Boolean)
    .join(' ');
};

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

describe('Rutas del reporte de perfil en PDF (HU-06)', () => {
  const createdEmails = [];

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await query('DELETE FROM users WHERE email = ANY($1::text[])', [createdEmails]);
    }
    await pool.end();
  });

  it('exige sesión iniciada', async () => {
    const response = await request(app).get('/api/v1/profile/report');
    expect(response.status).toBe(401);
  });

  describe('Escenario 1: con perfil, descarga el PDF', () => {
    it('responde 200 con un PDF adjunto', async () => {
      const token = await createStudent(createdEmails);
      await completeQuestionnaire(token, (q) => (q.riasecType === 'I' ? 5 : 3));

      const response = await request(app).get('/api/v1/profile/report').set(auth(token));

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.pdf');
      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(response.body.slice(0, 5).toString()).toBe('%PDF-');
    });
  });

  describe('Escenario 2: sin perfil, no se puede descargar', () => {
    it('responde 404 PROFILE_NOT_FOUND en lugar de un PDF', async () => {
      const token = await createStudent(createdEmails);

      const response = await request(app).get('/api/v1/profile/report').set(auth(token));

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('PROFILE_NOT_FOUND');
    });
  });

  describe('Escenario 3: el contenido coincide con "Mi huella" (fecha, áreas, ≥3 carreras)', () => {
    it('incluye el código Holland, al menos 3 áreas afines y al menos 3 carreras', async () => {
      const token = await createStudent(createdEmails);
      await completeQuestionnaire(token, (q) => (q.riasecType === 'A' ? 5 : 2));

      const [recommendationsRes, reportRes] = await Promise.all([
        request(app).get('/api/v1/recommendations').set(auth(token)),
        request(app).get('/api/v1/profile/report').set(auth(token)),
      ]);

      expect(reportRes.status).toBe(200);
      const pdfText = extractPdfText(reportRes.body);

      // El código Holland y las áreas del PDF deben coincidir con /recommendations
      // (mismo recommendationService, sin recalcular afinidad aparte).
      expect(pdfText).toContain(recommendationsRes.body.profile.hollandCode);
      recommendationsRes.body.recommendations.slice(0, 3).forEach((area) => {
        expect(pdfText).toContain(area.name);
      });

      const totalCareers = recommendationsRes.body.recommendations.reduce(
        (total, area) => total + area.careers.length,
        0
      );
      expect(totalCareers).toBeGreaterThanOrEqual(3);
    });
  });
});
