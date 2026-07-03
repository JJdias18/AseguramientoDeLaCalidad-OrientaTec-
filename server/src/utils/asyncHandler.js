/** Envuelve un handler async para delegar sus errores al middleware centralizado. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
