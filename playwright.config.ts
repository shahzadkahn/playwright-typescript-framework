// Loads .env first, so environment settings below can read it.
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { ENV } from './config/environments';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          Environment: ENV.name,
          'UI base URL': ENV.uiBaseUrl,
          'API base URL': ENV.apiBaseUrl,
          'Node version': process.version,
        },
      },
    ],
  ],

  use: {
    // Sauce Demo marks elements with data-test, so getByTestId() uses it.
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Logs in once and saves the session, so UI tests start already signed in.
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      use: { baseURL: ENV.uiBaseUrl },
    },
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], baseURL: ENV.uiBaseUrl },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], baseURL: ENV.uiBaseUrl },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: ENV.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
