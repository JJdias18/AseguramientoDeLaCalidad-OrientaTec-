const requireRole = require('../../src/middlewares/roleMiddleware');

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('requireRole', () => {
  it('llama a next() cuando el usuario tiene el rol requerido', () => {
    const req = { user: { id: 1, role: 'admin' } };
    const res = buildRes();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('responde 403 cuando el usuario no tiene el rol requerido', () => {
    const req = { user: { id: 1, role: 'student' } };
    const res = buildRes();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
