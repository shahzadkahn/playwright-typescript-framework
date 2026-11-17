import { test as setup } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { users } from '@data/users';
import { AUTH_FILE } from '@utils/constants';

/**
 * Signs in once and saves the browser session to disk. UI projects depend on
 * this, so most tests skip the login screen and run faster and more reliably.
 */
setup('sign in as the standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.standard);
  await new InventoryPage(page).waitForLoaded();

  await page.context().storageState({ path: AUTH_FILE });
});
