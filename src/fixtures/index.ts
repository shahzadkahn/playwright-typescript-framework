import { test as base, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { BookingClient } from '@api/BookingClient';
import { AUTH_FILE } from '@utils/constants';

/**
 * Custom fixtures give every test ready-made page objects and API clients,
 * so specs read as user intent with no setup noise.
 */
interface PageFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
}

interface ApiFixtures {
  bookingClient: BookingClient;
  /** A signed-in client that also deletes bookings the test created. */
  authedBookingClient: BookingClient & { track: (id: number) => void };
}

export const test = base.extend<PageFixtures & ApiFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  bookingClient: async ({ request }, use) => use(new BookingClient(request)),

  authedBookingClient: async ({ request }, use) => {
    const client = new BookingClient(request);
    await client.authenticate();

    const created: number[] = [];
    const tracked = Object.assign(client, { track: (id: number) => created.push(id) });

    await use(tracked);

    // Clean up test data even when the test fails.
    for (const id of created) {
      await client.deleteBooking(id).catch(() => undefined);
    }
  },
});

/** For tests that must start signed out, such as login tests. */
export const signedOut = { storageState: { cookies: [], origins: [] } };

/** For tests that start signed in, using the session saved by the setup project. */
export const signedIn = { storageState: AUTH_FILE };

export { expect };
