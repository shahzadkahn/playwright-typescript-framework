import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Shared behaviour for every page object: navigation, the header that
 * appears on signed-in pages, and a common way to wait for a page to load.
 */
export abstract class BasePage {
  /** Path relative to the base URL, for example "/inventory.html". */
  protected abstract readonly path: string;

  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;
  readonly pageTitle: Locator;

  constructor(protected readonly page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.pageTitle = page.getByTestId('title');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForLoaded();
  }

  /** Each page confirms it has loaded by checking its own key element. */
  abstract waitForLoaded(): Promise<void>;

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  /** Number shown on the cart icon, or 0 when the badge is hidden. */
  async cartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    return Number(await this.cartBadge.innerText());
  }

  async expectUrl(): Promise<void> {
    const escaped = this.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(this.page).toHaveURL(new RegExp(`${escaped}$`));
  }
}
