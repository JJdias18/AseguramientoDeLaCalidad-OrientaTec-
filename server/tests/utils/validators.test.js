const { isValidEmail, isValidPassword } = require('../../src/utils/validators');

describe('isValidEmail', () => {
  it('acepta un correo con formato válido', () => {
    expect(isValidEmail('valeria@ejemplo.cr')).toBe(true);
  });

  it('rechaza un correo sin arroba', () => {
    expect(isValidEmail('valeria-ejemplo.cr')).toBe(false);
  });

  it('rechaza un correo sin dominio', () => {
    expect(isValidEmail('valeria@')).toBe(false);
  });

  it('rechaza un valor vacío', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('acepta una contraseña de al menos 8 caracteres con letras y números', () => {
    expect(isValidPassword('clave1234')).toBe(true);
  });

  it('rechaza una contraseña de menos de 8 caracteres', () => {
    expect(isValidPassword('abc123')).toBe(false);
  });

  it('rechaza una contraseña sin números', () => {
    expect(isValidPassword('clavesecreta')).toBe(false);
  });

  it('rechaza una contraseña sin letras', () => {
    expect(isValidPassword('12345678')).toBe(false);
  });
});
