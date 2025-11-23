module.exports = {
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // TypeScript rules - relaxed for flexibility
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    // Modern JavaScript enforcement
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'off',
    'prefer-template': 'error',

    // Code quality
    'eqeqeq': ['error', 'always'],
    'no-console': 'off',
    'no-debugger': 'error',
    'no-alert': 'off',
    'no-unused-expressions': 'error',
    'no-useless-return': 'off',

    // React Native specific - prevent && in JSX
    'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary'] }],

    // Style rules - relaxed
    'semi': 'off',
    'quotes': 'off',
    'comma-dangle': 'off',
    'indent': ['error', 2, { SwitchCase: 1 }],
    'max-len': ['error', { code: 180, ignoreUrls: true }],
  },
  overrides: [
    {
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-undef': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'web-build/',
    'backend/',
    '**/*.config.js',
    '**/*.min.js',
  ],
};
