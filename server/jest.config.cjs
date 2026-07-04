module.exports = {
  testEnvironment: 'node',
  // Los tests de rutas comparten una única base de datos real (sin mocks). Desde
  // HU-07, adminQuestionRoutes.test.js muta el conteo de reactivos activos que
  // questionnaireRoutes.test.js verifica en 30 exactos: correr los archivos en
  // paralelo (workers por defecto) puede hacer que ambos se pisen.
  maxWorkers: 1,
};
