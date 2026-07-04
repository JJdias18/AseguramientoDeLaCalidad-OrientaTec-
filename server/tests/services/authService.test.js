require('dotenv').config();

const { pool, query } = require('../../src/config/db');
const authService = require('../../src/services/authService');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@ejemplo.cr`;

describe('authService', () => {
  const createdEmails = [];

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await query('DELETE FROM users WHERE email = ANY($1::text[])', [createdEmails]);
    }
    await pool.end();
  });

  describe('register', () => {
    it('crea un usuario con la contraseña hasheada (no en texto plano)', async () => {
      const email = uniqueEmail();
      createdEmails.push(email);

      const user = await authService.register({
        fullName: 'Valeria Mora',
        email,
        password: 'clave1234',
      });

      expect(user).toMatchObject({ fullName: 'Valeria Mora', email, role: 'student' });
      expect(user.passwordHash).toBeUndefined();
      expect(user.password).toBeUndefined();

      const stored = await query('SELECT password_hash FROM users WHERE email = $1', [email]);
      expect(stored.rows[0].password_hash).not.toBe('clave1234');
    });

    it('rechaza el registro si el correo ya tiene una cuenta', async () => {
      const email = uniqueEmail();
      createdEmails.push(email);

      await authService.register({ fullName: 'Valeria Mora', email, password: 'clave1234' });

      await expect(
        authService.register({ fullName: 'Otra Persona', email, password: 'clave5678' })
      ).rejects.toMatchObject({ status: 409, code: 'EMAIL_TAKEN' });
    });
  });

  describe('login', () => {
    it('devuelve un token JWT y los datos del usuario con credenciales correctas', async () => {
      const email = uniqueEmail();
      createdEmails.push(email);
      await authService.register({ fullName: 'Valeria Mora', email, password: 'clave1234' });

      const result = await authService.login({ email, password: 'clave1234' });

      expect(typeof result.token).toBe('string');
      expect(result.user).toMatchObject({ email, fullName: 'Valeria Mora', role: 'student' });
    });

    it('rechaza el login con contraseña incorrecta con mensaje genérico', async () => {
      const email = uniqueEmail();
      createdEmails.push(email);
      await authService.register({ fullName: 'Valeria Mora', email, password: 'clave1234' });

      await expect(authService.login({ email, password: 'incorrecta1' })).rejects.toMatchObject({
        status: 401,
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('rechaza el login con un correo que no existe con el mismo mensaje genérico', async () => {
      await expect(
        authService.login({ email: uniqueEmail(), password: 'clave1234' })
      ).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
    });
  });
});
