import { test, expect, signedOut } from '@fixtures';
import { users, type TestUser } from '@data/users';

test.use(signedOut);

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can sign in @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.standard);

    await inventoryPage.waitForLoaded();
    await inventoryPage.expectUrl();
  });

  test('locked-out user sees a clear error', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut);

    await loginPage.expectError('Sorry, this user has been locked out.');
  });

  // Data-driven: one test definition, several input combinations.
  const invalidCases: { name: string; user: TestUser; error: string }[] = [
    { name: 'wrong credentials', user: users.invalid, error: 'Username and password do not match' },
    { name: 'missing username', user: { username: '', password: 'secret_sauce' }, error: 'Username is required' },
    { name: 'missing password', user: { username: 'standard_user', password: '' }, error: 'Password is required' },
  ];

  for (const { name, user, error } of invalidCases) {
    test(`shows an error for ${name}`, async ({ loginPage }) => {
      await loginPage.login(user);

      await loginPage.expectError(error);
    });
  }

  test('signed-out users cannot open the inventory page directly', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await loginPage.expectError("You can only access '/inventory.html' when you are logged in.");
  });

  test('user can sign out', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard);
    await inventoryPage.waitForLoaded();

    await inventoryPage.logout();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
});
