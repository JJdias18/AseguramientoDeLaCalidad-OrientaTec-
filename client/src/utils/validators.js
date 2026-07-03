const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email);

export const isValidPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[a-zA-Z]/.test(password) &&
  /[0-9]/.test(password);
