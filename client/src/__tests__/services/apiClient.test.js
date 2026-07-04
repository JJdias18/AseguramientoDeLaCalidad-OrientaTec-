import apiRequest from '../../services/apiClient';

describe('apiRequest', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('devuelve el cuerpo parseado cuando la respuesta es exitosa', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: 1 } }),
    });

    const result = await apiRequest('/auth/me', { token: 'abc' });

    expect(result).toEqual({ user: { id: 1 } });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer abc' }),
      })
    );
  });

  it('envía el body como JSON en peticiones POST', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 201, json: async () => ({}) });

    await apiRequest('/auth/register', { method: 'POST', body: { email: 'a@b.cr' } });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.cr' }),
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('lanza un error con code y message cuando la respuesta no es exitosa', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { code: 'INVALID_CREDENTIALS', message: 'Correo o contraseña incorrectos.' },
      }),
    });

    await expect(apiRequest('/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Correo o contraseña incorrectos.',
    });
  });
});
