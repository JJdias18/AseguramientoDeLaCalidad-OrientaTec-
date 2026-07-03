const { query } = require('../config/db');

const findAll = async () => {
  try {
    const result = await query('SELECT * FROM careers ORDER BY name ASC');
    return result.rows;
  } catch (error) {
    console.error('Error listando carreras:', error.message);
    throw error;
  }
};

const findById = async (id) => {
  try {
    const result = await query('SELECT * FROM careers WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error buscando carrera por id:', error.message);
    throw error;
  }
};

const findByArea = async (areaId) => {
  try {
    const result = await query('SELECT * FROM careers WHERE area_id = $1 ORDER BY name ASC', [
      areaId,
    ]);
    return result.rows;
  } catch (error) {
    console.error('Error buscando carreras por área:', error.message);
    throw error;
  }
};

module.exports = { findAll, findById, findByArea };
