const express = require('express');

const app = express();

app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 con el formato de error uniforme del proyecto.
app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Recurso no encontrado.' },
  });
});

/**
 * Manejador de errores centralizado. Toda ruta asíncrona debe delegar aquí
 * sus errores para responder siempre con { error: { code, message } }.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Error interno del servidor.',
    },
  });
});

module.exports = app;
