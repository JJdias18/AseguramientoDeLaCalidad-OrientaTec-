/** Requiere que req.user (adjuntado por authMiddleware) tenga el rol indicado. */
const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'No tenés permiso para acceder a este recurso.' },
    });
    return;
  }
  next();
};

module.exports = requireRole;
