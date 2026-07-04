const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const profileRoutes = require('./routes/profileRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const careerRoutes = require('./routes/careerRoutes');
const adminQuestionRoutes = require('./routes/adminQuestionRoutes');

const app = express();

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    // Sin header Origin (curl, Postman, server-to-server): no aplica CORS, se permite.
    origin: (origin, callback) => callback(null, !origin || origin === allowedOrigin),
  })
);
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/attempts', attemptRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/careers', careerRoutes);
app.use('/api/v1/admin/questions', adminQuestionRoutes);

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
  const error = {
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Error interno del servidor.',
  };
  if (err.details !== undefined) {
    error.details = err.details;
  }
  res.status(status).json({ error });
});

module.exports = app;
