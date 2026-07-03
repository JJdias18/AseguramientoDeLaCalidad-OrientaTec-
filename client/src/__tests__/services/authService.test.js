import { register, login, me } from '../../services/authService';

jest.mock('../../services/apiClient', () => jest.fn());

const apiRequest = jest.requireMock('../../services/apiClient');

describe('authService (cliente)', () => {
  afterEach(() => jest.resetAllMocks());

  it('register envía POST /auth/register con los datos del formulario', async () => {
    apiRequest.mockResolvedValue({ user: { id: 1, email: 'a@b.cr' } });

    const result = await register({ fullName: 'Valeria', email: 'a@b.cr', password: 'clave1234' });

    expect(apiRequest).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { fullName: 'Valeria', email: 'a@b.cr', password: 'clave1234' },
    });
    expect(result).toEqual({ user: { id: 1, email: 'a@b.cr' } });
  });

  it('login envía POST /auth/login y devuelve token + user', async () => {
    apiRequest.mockResolvedValue({ token: 'jwt', user: { id: 1 } });

    const result = await login({ email: 'a@b.cr', password: 'clave1234' });

    expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.cr', password: 'clave1234' },
    });
    expect(result).toEqual({ token: 'jwt', user: { id: 1 } });
  });

  it('me envía GET /auth/me con el token', async () => {
    apiRequest.mockResolvedValue({ user: { id: 1 } });

    const result = await me('jwt');

    expect(apiRequest).toHaveBeenCalledWith('/auth/me', { token: 'jwt' });
    expect(result).toEqual({ user: { id: 1 } });
  });
});
