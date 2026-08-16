const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;
const GENERIC_LOGIN_ERROR = 'Correo o contraseña incorrectos.';

const toPublicUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at,
});

/**
 * Registra un usuario nuevo. Asume que el formato de correo/contraseña ya fue
 * validado por la capa de controlador (sección 9 de EstandaresdeCodigo.md).
 */
const register = async ({ fullName, email, password }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError(409, 'EMAIL_TAKEN', 'Ese correo ya tiene una cuenta.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const created = await userRepository.create({ fullName, email, passwordHash });
  return toPublicUser(created);
};

const generateToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/** Mensaje y código genéricos: nunca revela si falló el correo o la contraseña (HU-01). */
const login = async ({ email, password }) => {
  const userRow = await userRepository.findByEmail(email);
  if (!userRow) {
    throw new AppError(401, 'INVALID_CREDENTIALS', GENERIC_LOGIN_ERROR);
  }

  const passwordMatches = await bcrypt.compare(password, userRow.password_hash);
  if (!passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', GENERIC_LOGIN_ERROR);
  }

  const user = toPublicUser(userRow);
  return { token: generateToken(user), user };
};

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { register, login, generateToken, verifyToken, toPublicUser };
