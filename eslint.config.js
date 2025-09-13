const globals = require('globals');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': ['error', { args: 'none' }]
    }
  }
];
