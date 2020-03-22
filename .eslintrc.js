module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    "plugin:react/recommended",
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      args: 'all',
      varsIgnorePattern: '(_.*|preactH)',
      argsIgnorePattern: '_.*',
    }],
    'no-underscore-dangle': 'off',
    'spaced-comment': 'off',
  },
};
