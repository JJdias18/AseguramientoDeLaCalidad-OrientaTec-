const { query } = require('../config/db');

const create = async ({ userId, attemptId, scores, hollandCode }) => {
  try {
    const result = await query(
      `INSERT INTO profiles (user_id, attempt_id, scores, holland_code)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, attemptId, scores, hollandCode]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creando perfil:', error.message);
    throw error;
  }
};

/** El perfil más reciente del usuario (los reintentos están permitidos). */
const findLatestByUser = async (userId) => {
  try {
    const result = await query(
      'SELECT * FROM profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error buscando perfil más reciente:', error.message);
    throw error;
  }
};

module.exports = { create, findLatestByUser };
