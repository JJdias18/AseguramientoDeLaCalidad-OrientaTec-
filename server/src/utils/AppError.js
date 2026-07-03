/**
 * Error de aplicación con status HTTP y code, para el formato uniforme
 * { error: { code, message } }. `details` es opcional y se incluye en la
 * respuesta cuando aporta datos accionables (p. ej. los reactivos sin responder).
 */
class AppError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

module.exports = AppError;
