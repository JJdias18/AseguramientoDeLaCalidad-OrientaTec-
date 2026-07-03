module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  // Solo bajo Jest: Vite resuelve import.meta.env de forma nativa; Jest (CommonJS)
  // necesita este plugin para no romper el parseo. Ver PLAN.md "Decisiones tomadas".
  env: {
    test: {
      plugins: ['transform-vite-meta-env'],
    },
  },
};
