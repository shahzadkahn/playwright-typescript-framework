import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'allure-report', 'allure-results', 'test-results'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Page objects hold the assertions, so tests can call them instead of expect().
      'playwright/expect-expect': [
        'error',
        { assertFunctionPatterns: ['^expect[A-Z]', '^waitForLoaded$'] },
      ],
    },
  },
);
