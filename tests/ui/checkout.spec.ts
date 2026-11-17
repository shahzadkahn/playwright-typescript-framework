import { test, expect, signedIn } from '@fixtures';
import { products, TAX_RATE } from '@data/products';
import { checkoutCustomer } from '@data/users';

test.use(signedIn);

test.describe('Cart and checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('user can buy two items end to end @smoke', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const basket = [products.backpack, products.boltTShirt];

    await test.step('add items to the cart', async () => {
      for (const product of basket) await inventoryPage.addToCart(product);
      await inventoryPage.openCart();
      await cartPage.waitForLoaded();
      expect(await cartPage.names()).toEqual(basket.map((p) => p.name));
    });

    await test.step('enter customer details', async () => {
      await cartPage.checkout();
      await checkoutPage.waitForLoaded();
      await checkoutPage.fillCustomerInfo(checkoutCustomer);
    });

    await test.step('check the order totals', async () => {
      const expectedSubtotal = basket.reduce((sum, p) => sum + p.price, 0);
      const expectedTax = Math.round(expectedSubtotal * TAX_RATE * 100) / 100;

      const { subtotal, tax, total } = await checkoutPage.totals();
      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(tax).toBeCloseTo(expectedTax, 2);
      expect(total).toBeCloseTo(expectedSubtotal + expectedTax, 2);
    });

    await test.step('place the order', async () => {
      await checkoutPage.finish();
      await checkoutPage.expectOrderComplete();
      expect(await checkoutPage.cartCount()).toBe(0);
    });
  });

  test('checkout requires customer details', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.fillCustomerInfo({ ...checkoutCustomer, postalCode: '' });

    await expect(checkoutPage.errorMessage).toContainText('Postal Code is required');
  });

  test('items stay in the cart after continuing to shop', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.continueShoppingButton.click();

    await inventoryPage.waitForLoaded();
    expect(await inventoryPage.cartCount()).toBe(1);
  });
});
