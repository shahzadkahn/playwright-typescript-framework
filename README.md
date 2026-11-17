# Playwright + TypeScript Test Automation Framework

[![E2E Tests](https://github.com/shahzadkahn/playwright-typescript-framework/actions/workflows/e2e.yml/badge.svg)](https://github.com/shahzadkahn/playwright-typescript-framework/actions/workflows/e2e.yml)
[![Allure Report](https://img.shields.io/badge/report-Allure-orange)](https://shahzadkahn.github.io/playwright-typescript-framework/)
![Playwright](https://img.shields.io/badge/Playwright-1.49-2EAD33?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

A UI and API test automation framework built the way I set up frameworks on real projects: Page Object Model, custom fixtures, typed API clients, environment config, parallel runs across browsers, and a CI pipeline that runs every night and publishes an Allure report.

It tests two public demo applications, so anyone can clone it and run it:

| Layer | Application under test | What is covered |
|---|---|---|
| UI | [Sauce Demo](https://www.saucedemo.com) | Login (valid, locked out, data-driven invalid cases), product sorting, cart, full checkout with tax and total checks, logout |
| API | [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | Health check, token auth, full CRUD on bookings, filters, unauthorized updates, negative cases |

**Live report:** the latest nightly run is published at https://shahzadkahn.github.io/playwright-typescript-framework/

## Highlights

- **Page Object Model** with a shared `BasePage` for navigation, header and cart actions
- **Custom fixtures** (`base.extend`) so tests get ready page objects and API clients injected, with no setup code in the test body
- **Log in once, reuse the session**: a setup project saves `storageState`, and UI tests start already signed in
- **API client layer** with typed payloads, token handling and automatic cleanup of any booking a test creates
- **Test data factory** that builds unique bookings per test, so tests run in parallel without clashing
- **Data-driven tests** for the invalid login cases
- **Cross-browser**: Chromium and Firefox projects
- **Multi-environment** config via `TEST_ENV`, with URL overrides through `.env`
- **Debuggable failures**: trace, screenshot and video kept only for failed tests
- **Tags** like `@smoke` for quick suites
- **CI/CD** in GitHub Actions: lint and type check, tests on push, PR and nightly, Allure deployed to GitHub Pages
- **Code quality**: strict TypeScript, ESLint with the Playwright plugin

## Project structure

```
.
├── config/
│   └── environments.ts        # demo / staging URLs, picked by TEST_ENV
├── src/
│   ├── api/                   # BookingClient + typed request/response models
│   ├── data/                  # users, products, booking factory
│   ├── fixtures/              # custom Playwright fixtures
│   ├── pages/                 # page objects (BasePage, Login, Inventory, Cart, Checkout)
│   └── utils/
├── tests/
│   ├── global.setup.ts        # signs in once, saves the session
│   ├── ui/                    # login, inventory, checkout specs
│   └── api/                   # auth and booking specs
├── playwright.config.ts       # projects, reporters, retries, artifacts
└── .github/workflows/e2e.yml  # CI pipeline
```

## How a test reads

Fixtures and page objects keep the specs short and readable:

```ts
test('customer can buy two items end to end @smoke', async ({ inventoryPage, cartPage, checkoutPage }) => {
  await test.step('add items to the cart', async () => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
  });

  await test.step('check out', async () => {
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(checkoutCustomer);
  });

  // subtotal, tax and total are verified against the product data
});
```

## Getting started

Requirements: Node.js 20 or later.

```bash
git clone https://github.com/shahzadkahn/playwright-typescript-framework.git
cd playwright-typescript-framework
npm ci
npx playwright install --with-deps
cp .env.example .env   # optional
```

## Running tests

| Command | What it runs |
|---|---|
| `npm test` | Everything: UI on Chromium and Firefox, plus API |
| `npm run test:ui` | UI tests only |
| `npm run test:api` | API tests only |
| `npm run test:smoke` | Tests tagged `@smoke` |
| `npm run test:headed` | UI tests with a visible browser |
| `npm run test:debug` | Step through with the Playwright Inspector |
| `npm run report:html` | Open the Playwright HTML report |
| `npm run allure:generate && npm run allure:open` | Build and open the Allure report |
| `npm run typecheck` / `npm run lint` | Static checks |

Run against another environment:

```bash
TEST_ENV=staging npm test
```

## CI pipeline

`.github/workflows/e2e.yml` runs on every push and pull request to `main`, every night at 02:00 UTC, and on demand.

1. **Quality gate**: `npm ci`, type check, lint
2. **Tests**: installs browsers, runs all projects with 2 retries and 4 workers
3. **Reports**: uploads the Playwright HTML report, plus traces and videos when something fails
4. **Publish**: deploys the Allure report to GitHub Pages from `main`

## Design decisions

- **Selectors** use `data-test` attributes (`testIdAttribute` in the config) so tests do not break when styling or copy changes.
- **Assertions live close to intent.** Page objects expose actions and small `expect...` helpers; specs describe the user journey.
- **No hard waits.** Everything relies on Playwright's auto-waiting and web-first assertions.
- **API tests clean up after themselves.** The `authedBookingClient` fixture tracks created bookings and deletes them in teardown.
- **Known quirks of the demo API** (for example, a bad login returns 200 with a reason) are asserted as they are and commented, rather than hidden.

## Author

**Shahzad Zaman Khan**, QA Automation Engineer
7+ years in manual and automation testing with Selenium (Java), Playwright (TypeScript), API testing, JMeter and CI/CD.

[LinkedIn](https://www.linkedin.com/in/LINKEDIN_HANDLE)

## License

MIT
