/** Error de aplicación con status HTTP y code, para el formato uniforme { error: { code, message } }. */
class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = AppError;
