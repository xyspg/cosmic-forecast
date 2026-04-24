import { expect, test } from "@playwright/test";

import markets from "../../data/markets.json";

// The app picks `lead` as the first featured+unresolved market at render time.
// Mirror that selection so selectors stay correct when the JSON shifts.
const featured = markets.find((m) => m.featured && !m.resolved) as (typeof markets)[number];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const featuredQuestionRegex = new RegExp(esc(featured.question));

test.describe("homepage", () => {
  test("masthead shows active-market count and open interest", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/\d+ ACTIVE MARKETS/)).toBeVisible();
    await expect(page.getByText(/OPEN INTEREST$/)).toBeVisible();
    await expect(page.getByText(/NEXT SETTLEMENT ·/)).toBeVisible();
  });

  test("lead market eyebrow + headline render", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("◈ FEATURED MARKET")).toBeVisible();

    // LeadMarket renders the featured question as a clickable h1.
    await expect(
      page.getByRole("heading", { level: 1, name: featuredQuestionRegex }),
    ).toBeVisible();

    // "Market specification" side panel
    await expect(page.getByText("Market specification")).toBeVisible();
    await expect(page.getByText(/Open interest/i).first()).toBeVisible();
  });

  test("category filter narrows active markets table", async ({ page }) => {
    await page.goto("/");

    // Wait for hydration — CategoryBar is a client component rendered after
    // HomeLoading is replaced.
    await expect(page.getByText("Active markets", { exact: true })).toBeVisible();

    // Trump market lives in the grid as a table row — not as an h1 (that's
    // reserved for the lead market). It appears in the market cell as a div
    // with the bureau-serif class.
    const trumpRow = page.getByText(/Trump win the 2028 presidential election/);
    await expect(trumpRow.first()).toBeVisible();

    await page.getByRole("button", { name: /^Sports$/ }).click();
    // Row should disappear from the filtered table.
    await expect(trumpRow).toHaveCount(0);

    // Restore filter so test teardown isn't misleading.
    await page.getByRole("button", { name: /^All$/ }).click();
    await expect(trumpRow.first()).toBeVisible();
  });

  test("clicking the lead market navigates to its detail page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("heading", { level: 1, name: featuredQuestionRegex }).click();

    await expect(page).toHaveURL(new RegExp(`/market/${featured.id}`));
    // Same question now renders as the market-page hero headline.
    await expect(
      page.getByRole("heading", { level: 1, name: featuredQuestionRegex }),
    ).toBeVisible();
  });

  test("market table row click navigates to that market", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Active markets", { exact: true })).toBeVisible();

    // Trump row exists in the table (the lead slot shows Mars).
    await page
      .getByText(/Trump win the 2028 presidential election/)
      .first()
      .click();
    await expect(page).toHaveURL(/\/market\/will-trump-win-2028-presidential-election/);
  });
});
