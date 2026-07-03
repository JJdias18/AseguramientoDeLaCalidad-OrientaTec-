const { query } = require('../config/db');

const findAll = async () => {
  try {
    const result = await query('SELECT * FROM areas ORDER BY name ASC');
    return result.rows;
  } catch (error) {
    console.error('Error listando áreas:', error.message);
    throw error;
  }
};

const findById = async (id) => {
  try {
    const result = await query('SELECT * FROM areas WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error buscando área por id:', error.message);
    throw error;
  }
};

module.exports = { findAll, findById };
