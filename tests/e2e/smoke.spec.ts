import { expect, test } from "@playwright/test";

// Smoke tests — each route renders without throwing and shows a key,
// refactor-specific landmark. Assertions are intentionally narrow so a
// future layout tweak doesn't break them.
test.describe("smoke", () => {
  test("homepage renders Bureau nav + masthead", async ({ page }) => {
    await page.goto("/");
    // Nav wordmark
    await expect(page.getByText("Cosmic Forecast").first()).toBeVisible();
    await expect(
      page.getByText("Bureau of Prediction Markets").first(),
    ).toBeVisible();
    // Masthead
    await expect(page.getByText("The Prediction Record")).toBeVisible();
    // Cash pill shows $1000.00 after hydration
    await expect(page.getByText("$1000.00")).toBeVisible();
  });

  test("ledger page shows statement of account", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.getByText("Declarant ledger")).toBeVisible();
    await expect(page.getByText("Cash balance")).toBeVisible();
    // Formatted with thousands separator on wallet page: $1,000.00
    await expect(page.getByText("$1,000.00").first()).toBeVisible();
  });

  test("market detail page renders hero + order ticket", async ({ page }) => {
    await page.goto("/market/humans-on-mars-before-2035");
    await expect(
      page.getByRole("heading", { level: 1, name: /Mars before 2035/ }),
    ).toBeVisible();
    await expect(page.getByText("Order ticket")).toBeVisible();
    await expect(page.getByText("FORM PM-4", { exact: true })).toBeVisible();
  });

  test("unresolved market resolution page shows no record notice", async ({
    page,
  }) => {
    await page.goto("/resolution/humans-on-mars-before-2035");
    await expect(page.getByText("— NO RECORD ON FILE —")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Return to market/ }),
    ).toBeVisible();
  });

  test("nav Ledger link jumps to wallet", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^Ledger$/i }).click();
    await expect(page).toHaveURL(/\/wallet$/);
    await expect(page.getByText("Declarant ledger")).toBeVisible();
  });
});
