require('dotenv').config();

const { pool, query } = require('../src/config/db');

describe('Conexión a PostgreSQL (smoke test)', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('conecta y responde a una consulta simple', async () => {
    const result = await query('SELECT 1 AS ok');

    expect(result.rows[0].ok).toBe(1);
  });

  it('encuentra la BD poblada por migrate + seed', async () => {
    const [areas, careers, questions, admins] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM areas'),
      query('SELECT COUNT(*)::int AS count FROM careers'),
      query('SELECT COUNT(*)::int AS count FROM questions WHERE is_active = true'),
      query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'"),
    ]);

    expect(areas.rows[0].count).toBeGreaterThanOrEqual(5);
    expect(careers.rows[0].count).toBeGreaterThanOrEqual(20);
    expect(questions.rows[0].count).toBeGreaterThanOrEqual(30);
    expect(admins.rows[0].count).toBeGreaterThanOrEqual(1);
  });
});
