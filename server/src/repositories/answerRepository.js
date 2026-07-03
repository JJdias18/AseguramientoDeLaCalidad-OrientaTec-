const { query } = require('../config/db');

/** Autosave: si ya existe una respuesta para ese reactivo en el intento, la reemplaza. */
const upsert = async ({ attemptId, questionId, value }) => {
  try {
    const result = await query(
      `INSERT INTO answers (attempt_id, question_id, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (attempt_id, question_id) DO UPDATE SET value = EXCLUDED.value
       RETURNING *`,
      [attemptId, questionId, value]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error guardando respuesta:', error.message);
    throw error;
  }
};

const findByAttempt = async (attemptId) => {
  try {
    const result = await query('SELECT * FROM answers WHERE attempt_id = $1', [attemptId]);
    return result.rows;
  } catch (error) {
    console.error('Error listando respuestas del intento:', error.message);
    throw error;
  }
};

module.exports = { upsert, findByAttempt };
