const { query } = require('../config/db');

/** El cuestionario solo debe servir reactivos activos. */
const findActive = async () => {
  try {
    const result = await query('SELECT * FROM questions WHERE is_active = true ORDER BY id ASC');
    return result.rows;
  } catch (error) {
    console.error('Error listando reactivos activos:', error.message);
    throw error;
  }
};

/** Todos los reactivos (activos e inactivos), para el banco de reactivos del admin. */
const findAll = async () => {
  try {
    const result = await query('SELECT * FROM questions ORDER BY id ASC');
    return result.rows;
  } catch (error) {
    console.error('Error listando reactivos:', error.message);
    throw error;
  }
};

const findById = async (id) => {
  try {
    const result = await query('SELECT * FROM questions WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error buscando reactivo por id:', error.message);
    throw error;
  }
};

const create = async ({ text, riasecType, scaleMin = 1, scaleMax = 5 }) => {
  try {
    const result = await query(
      `INSERT INTO questions (text, riasec_type, scale_min, scale_max)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [text, riasecType, scaleMin, scaleMax]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creando reactivo:', error.message);
    throw error;
  }
};

const update = async (id, { text, riasecType }) => {
  try {
    const result = await query(
      `UPDATE questions SET text = $1, riasec_type = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [text, riasecType, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error actualizando reactivo:', error.message);
    throw error;
  }
};

/** Soft delete: nunca se borra físicamente porque `answers` referencia reactivos históricos. */
const deactivate = async (id) => {
  try {
    const result = await query(
      'UPDATE questions SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error desactivando reactivo:', error.message);
    throw error;
  }
};

module.exports = {
  findActive,
  findAll,
  findById,
  create,
  update,
  deactivate,
};
