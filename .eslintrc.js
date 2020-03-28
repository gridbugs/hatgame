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
  settings: {
    react: {
      version: '16',
    },
  },
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
    'class-methods-use-this': 'off',
    'comma-dangle': 'off',
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true,
    }],
    '@typescript-eslint/no-explicit-any': 'off',
    'max-classes-per-file': 'off',
    'no-console': 'off',
  },
};
