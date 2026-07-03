const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email);

/** Mínimo 8 caracteres, con al menos una letra y un número. */
const isValidPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[a-zA-Z]/.test(password) &&
  /[0-9]/.test(password);

module.exports = { isValidEmail, isValidPassword };
