import { test, expect, signedIn } from '@fixtures';
import { products } from '@data/products';

test.use(signedIn);

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('shows the full product catalogue @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('sorts products by name, Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.names();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('sorts products by price, low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by price, high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('cart badge tracks items added and removed', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    expect(await inventoryPage.cartCount()).toBe(2);

    await inventoryPage.removeFromCart(products.backpack);
    expect(await inventoryPage.cartCount()).toBe(1);
  });

  test('product details page shows the right product', async ({ inventoryPage, page }) => {
    await inventoryPage.openProduct(products.fleeceJacket);

    await expect(page.getByTestId('inventory-item-name')).toHaveText(products.fleeceJacket.name);
    await expect(page.getByTestId('inventory-item-price')).toHaveText(`$${products.fleeceJacket.price}`);
  });
});
