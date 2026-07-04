const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Ejecuta una consulta SQL usando el pool compartido.
 * Centraliza el logging de errores de base de datos para toda la capa de datos.
 */
const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('Error ejecutando consulta SQL:', error.message);
    throw error;
  }
};

module.exports = { pool, query };
