module.exports = {
  root: true,
  extends: ['airbnb', 'airbnb/hooks', 'prettier'],
  env: {
    browser: true,
    jest: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // React 18 con runtime automático de JSX: no hace falta importar React.
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    // Props opcionales con valor por defecto en la desestructuración (no defaultProps,
    // deprecado en componentes función desde React 18.3).
    'react/require-default-props': ['error', { functions: 'defaultArguments' }],
    // DESIGN.md exige label + input como hermanos (label real arriba, htmlFor/id),
    // nunca label envolviendo el control.
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'htmlFor' }],
  },
  overrides: [
    {
      files: ['vite.config.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules', 'dist', 'coverage'],
};
