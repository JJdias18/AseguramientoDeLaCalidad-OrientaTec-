const authService = require('../services/authService');
const AppError = require('../utils/AppError');
const { isValidEmail, isValidPassword } = require('../utils/validators');

const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName?.trim() || !email?.trim() || !password) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Nombre, correo y contraseña son obligatorios.');
  }
  if (!isValidEmail(email)) {
    throw new AppError(400, 'INVALID_EMAIL', 'El correo electrónico no tiene un formato válido.');
  }
  if (!isValidPassword(password)) {
    throw new AppError(
      400,
      'WEAK_PASSWORD',
      'La contraseña debe tener al menos 8 caracteres, con letras y números.'
    );
  }

  const user = await authService.register({ fullName: fullName.trim(), email, password });
  const token = authService.generateToken(user);
  res.status(201).json({ token, user });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Correo y contraseña son obligatorios.');
  }

  const { token, user } = await authService.login({ email, password });
  res.status(200).json({ token, user });
};

const me = (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { register, login, me };
