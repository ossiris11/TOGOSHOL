import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'server/dist/**',
      'node_modules/**',
      'tmp/**',
      'test-results/**',
      'playwright-report/**',
      'togoshol-frontend-standalone.html',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/immutability': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        AbortController: 'readonly',
        Blob: 'readonly',
        Buffer: 'readonly',
        CSSProperties: 'readonly',
        FormData: 'readonly',
        KeyboardEvent: 'readonly',
        React: 'readonly',
        RequestInit: 'readonly',
        console: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        window: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        AbortSignal: 'readonly',
        URL: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
      },
    },
  },
);
