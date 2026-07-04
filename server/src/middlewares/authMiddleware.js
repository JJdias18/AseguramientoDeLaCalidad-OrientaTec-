const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');

const UNAUTHORIZED = {
  error: { code: 'UNAUTHORIZED', message: 'Necesitás iniciar sesión para continuar.' },
};

/** Verifica el JWT del header Authorization y adjunta el usuario autenticado en req.user. */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json(UNAUTHORIZED);
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      res.status(401).json(UNAUTHORIZED);
      return;
    }
    req.user = { id: user.id, fullName: user.full_name, email: user.email, role: user.role };
    next();
  } catch (error) {
    res.status(401).json(UNAUTHORIZED);
  }
};

module.exports = requireAuth;
