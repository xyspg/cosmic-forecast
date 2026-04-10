import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("wallet page loads and shows balance", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.getByText("Total Balance")).toBeVisible();
    // balance.toFixed(2) → "1000.00" after hydration.
    await expect(page.getByText("$1000.00")).toBeVisible();
  });

  test("markets page loads and renders the grid", async ({ page }) => {
    await page.goto("/markets");
    await expect(page.getByText("All markets")).toBeVisible();
    await expect(
      page.getByText("Will Trump win the 2028 presidential election?"),
    ).toBeVisible();
  });

  test("direct market URL renders without error", async ({ page }) => {
    await page.goto("/market/will-trump-win-2028-presidential-election");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Trump win the 2028 presidential election/,
      }),
    ).toBeVisible();
  });

  test("navbar search jumps to a market", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder("Search markets...");
    await searchInput.click();
    await searchInput.fill("bitcoin");

    // Dropdown option is a button whose label is the question text.
    // Use onMouseDown-compatible click (Playwright click fires mousedown).
    const option = page.getByRole("button", { name: /Bitcoin/i }).first();
    await expect(option).toBeVisible();
    await option.click();

    await expect(page).toHaveURL(/\/market\/bitcoin-above-200k/);
  });
});
