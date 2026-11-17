/**
 * Test users for Sauce Demo. These are public demo accounts published on
 * the site's own login page, not real credentials. In a real project they
 * would come from environment variables or a secrets manager.
 */

export interface TestUser {
  username: string;
  password: string;
}

const DEMO_PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password: DEMO_PASSWORD },
  lockedOut: { username: 'locked_out_user', password: DEMO_PASSWORD },
  performanceGlitch: { username: 'performance_glitch_user', password: DEMO_PASSWORD },
  invalid: { username: 'not_a_real_user', password: 'wrong_password' },
} satisfies Record<string, TestUser>;

export const checkoutCustomer = {
  firstName: 'Shahzad',
  lastName: 'Khan',
  postalCode: 'T2P 1J9',
};
