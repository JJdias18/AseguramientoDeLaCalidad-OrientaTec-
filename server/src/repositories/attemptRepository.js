const { query } = require('../config/db');

const create = async (userId) => {
  try {
    const result = await query(
      "INSERT INTO attempts (user_id, status) VALUES ($1, 'in_progress') RETURNING *",
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creando intento:', error.message);
    throw error;
  }
};

const findCurrentByUser = async (userId) => {
  try {
    const result = await query(
      `SELECT * FROM attempts WHERE user_id = $1 AND status = 'in_progress'
       ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error buscando intento en curso:', error.message);
    throw error;
  }
};

const findById = async (id) => {
  try {
    const result = await query('SELECT * FROM attempts WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error buscando intento por id:', error.message);
    throw error;
  }
};

const complete = async (id) => {
  try {
    const result = await query(
      "UPDATE attempts SET status = 'completed', completed_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error completando intento:', error.message);
    throw error;
  }
};

module.exports = {
  create,
  findCurrentByUser,
  findById,
  complete,
};
