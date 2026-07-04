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

/**
 * Catálogo de carreras con su área (HU-04). Búsqueda por nombre insensible a
 * mayúsculas y acentos vía `unaccent(lower(...))`, y filtro opcional por área.
 * Todo el filtrado ocurre en SQL, nunca en JS.
 */
const search = async ({ search: term, areaId }) => {
  try {
    const conditions = [];
    const params = [];

    if (term) {
      params.push(`%${term}%`);
      conditions.push(`unaccent(lower(careers.name)) LIKE unaccent(lower($${params.length}))`);
    }
    if (areaId) {
      params.push(areaId);
      conditions.push(`careers.area_id = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT careers.*, areas.name AS area_name, areas.riasec_weights AS area_weights
       FROM careers
       JOIN areas ON areas.id = careers.area_id
       ${where}
       ORDER BY careers.name ASC`,
      params
    );
    return result.rows;
  } catch (error) {
    console.error('Error buscando carreras del catálogo:', error.message);
    throw error;
  }
};

/** Ficha de una carrera con el área embebida (para la huella "eco" y el punto de tinta). */
const findByIdWithArea = async (id) => {
  try {
    const result = await query(
      `SELECT careers.*, areas.name AS area_name, areas.riasec_weights AS area_weights
       FROM careers
       JOIN areas ON areas.id = careers.area_id
       WHERE careers.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error buscando ficha de carrera:', error.message);
    throw error;
  }
};

module.exports = { findAll, findById, findByArea, search, findByIdWithArea };
