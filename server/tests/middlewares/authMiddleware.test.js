const authService = require('../../src/services/authService');
const requireAuth = require('../../src/middlewares/authMiddleware');

jest.mock('../../src/services/authService');
jest.mock('../../src/repositories/userRepository');

const userRepository = require('../../src/repositories/userRepository');

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('requireAuth', () => {
  afterEach(() => jest.resetAllMocks());

  it('rechaza la petición si no hay header Authorization', async () => {
    const req = { headers: {} };
    const res = buildRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza la petición si el token es inválido', async () => {
    authService.verifyToken.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = { headers: { authorization: 'Bearer token-invalido' } };
    const res = buildRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('adjunta req.user y llama a next() con un token válido', async () => {
    authService.verifyToken.mockReturnValue({ sub: 7, role: 'student' });
    userRepository.findById.mockResolvedValue({
      id: 7,
      full_name: 'Valeria Mora',
      email: 'valeria@ejemplo.cr',
      role: 'student',
    });
    const req = { headers: { authorization: 'Bearer token-valido' } };
    const res = buildRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 7, role: 'student' });
  });
});
