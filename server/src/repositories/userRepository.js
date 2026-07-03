const { query } = require('../config/db');

/**
 * Crea un usuario nuevo. El hash de la contraseña se genera en la capa de
 * servicio (bcrypt); este repositorio solo persiste el hash recibido.
 */
const create = async ({ fullName, email, passwordHash, role = 'student' }) => {
  try {
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [fullName, email, passwordHash, role]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creando usuario:', error.message);
    throw error;
  }
};

const findByEmail = async (email) => {
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error buscando usuario por email:', error.message);
    throw error;
  }
};

const findById = async (id) => {
  try {
    const result = await query(
      'SELECT id, full_name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error buscando usuario por id:', error.message);
    throw error;
  }
};

module.exports = { create, findByEmail, findById };
