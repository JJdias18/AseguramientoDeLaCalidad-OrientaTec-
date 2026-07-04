import { isValidEmail, isValidPassword } from '../../utils/validators';

describe('isValidEmail', () => {
  it('acepta un correo con formato válido', () => {
    expect(isValidEmail('valeria@ejemplo.cr')).toBe(true);
  });

  it('rechaza un correo sin arroba', () => {
    expect(isValidEmail('valeria-ejemplo.cr')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('acepta una contraseña de al menos 8 caracteres con letras y números', () => {
    expect(isValidPassword('clave1234')).toBe(true);
  });

  it('rechaza una contraseña corta o sin números/letras', () => {
    expect(isValidPassword('abc123')).toBe(false);
    expect(isValidPassword('12345678')).toBe(false);
    expect(isValidPassword('clavesecreta')).toBe(false);
  });
});
