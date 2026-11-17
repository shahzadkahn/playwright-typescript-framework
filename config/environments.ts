/**
 * Multi-environment configuration.
 *
 * Select an environment with TEST_ENV (defaults to "demo").
 * Any URL can still be overridden directly with UI_BASE_URL or API_BASE_URL,
 * which is how CI points the suite at a different deployment without code changes.
 */

export type EnvironmentName = 'demo' | 'staging';

export interface Environment {
  name: EnvironmentName;
  uiBaseUrl: string;
  apiBaseUrl: string;
}

const environments: Record<EnvironmentName, Environment> = {
  demo: {
    name: 'demo',
    uiBaseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://restful-booker.herokuapp.com',
  },
  // Example of a second environment. Both demo apps only have one public
  // deployment, so staging reuses them; in a real project these differ.
  staging: {
    name: 'staging',
    uiBaseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://restful-booker.herokuapp.com',
  },
};

function resolveEnvironment(): Environment {
  const requested = (process.env.TEST_ENV ?? 'demo') as EnvironmentName;
  const env = environments[requested];

  if (!env) {
    const valid = Object.keys(environments).join(', ');
    throw new Error(`Unknown TEST_ENV "${requested}". Use one of: ${valid}`);
  }

  return {
    ...env,
    uiBaseUrl: process.env.UI_BASE_URL || env.uiBaseUrl,
    apiBaseUrl: process.env.API_BASE_URL || env.apiBaseUrl,
  };
}

export const ENV = resolveEnvironment();
