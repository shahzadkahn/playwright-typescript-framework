import { test, expect } from '@fixtures';

test.describe('Auth API', () => {
  test('issues a token for valid credentials @smoke', async ({ bookingClient }) => {
    const token = await bookingClient.authenticate();

    expect(token).toMatch(/^\w+$/);
  });

  test('refuses invalid credentials', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'not-the-password' },
    });

    // The demo API returns 200 with a reason instead of 401.
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ reason: 'Bad credentials' });
  });
});
