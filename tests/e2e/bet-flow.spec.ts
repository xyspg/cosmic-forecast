import { expect, type Page, test } from "@playwright/test";
import markets from "../../data/markets.json";
import { mockCosmicApis } from "../fixtures/mocks";

const featured = markets.find(
  (m) => m.featured && !m.resolved,
) as (typeof markets)[number];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const featuredQuestionRegex = new RegExp(esc(featured.question));

// Walk the full bet → speed-up → warp → resolution flow and leave the page
// sitting on /resolution/<slug>.
async function runBetFlow(
  page: Page,
  side: "YES" | "NO",
  amount: number,
): Promise<void> {
  await page.goto("/");

  // Lead market h1 is the clickable entry point.
  await page
    .getByRole("heading", { level: 1, name: featuredQuestionRegex })
    .click();
  await expect(page).toHaveURL(new RegExp(`/market/${featured.id}`));

  // OrderTicket side toggle: each button's accessible name is "YES 28¢" / "NO 72¢".
  const sideToggle = page
    .getByRole("button", { name: new RegExp(`^${side} \\d+¢$`) })
    .first();
  await sideToggle.click();

  // Principal field is the only <input type="text" inputmode="decimal"> in
  // the ticket. Fill it by clearing first (default is 100).
  const principal = page.locator('input[inputmode="decimal"]').first();
  await principal.fill(String(amount));

  // Submit button text is literal (not uppercased by DOM — CSS handles casing).
  const submit = page.getByRole("button", {
    name: new RegExp(`^Submit ${side} order · \\$${amount}\\.00$`),
  });
  await submit.click();

  // SpeedUpOverlay opens immediately after placeBet succeeds.
  const speedUp = page.getByRole("button", { name: /Speed up time/i });
  await expect(speedUp).toBeVisible({ timeout: 8_000 });
  await speedUp.click();

  // WarpAnimation runs ~5.6s, then the market page navigates to the
  // resolution route. Wait on URL rather than on any interior text.
  await expect(page).toHaveURL(new RegExp(`/resolution/${featured.id}`), {
    timeout: 20_000,
  });
}

test.describe("main bet flow", () => {
  test("Buy YES + outcome YES → win path", async ({ page }) => {
    await mockCosmicApis(page, { outcome: "YES" });
    await runBetFlow(page, "YES", 25);

    // Resolution page shows the outcome in the big FINAL DETERMINATION block.
    await expect(page.getByText("FINAL DETERMINATION")).toBeVisible();
    // Outcome rendered as heading-sized "YES" next to MARKET RESOLVED block.
    await expect(page.getByText("——— MARKET RESOLVED ———")).toBeVisible();

    // Position settlement block: Declared side YES, Net outcome positive.
    await expect(page.getByText("Position settlement")).toBeVisible();
    // YES-on-YES with $25 principal at yesPrice 0.28 → shares ≈ 89.29,
    // net = shares − principal ≈ +$64.29. Tolerate rounding with a loose regex.
    await expect(page.getByText(/^\+\$\d+\.\d{2}$/).first()).toBeVisible();
  });

  test("Buy NO + outcome NO → win path", async ({ page }) => {
    await mockCosmicApis(page, { outcome: "NO" });
    await runBetFlow(page, "NO", 25);

    await expect(page.getByText("FINAL DETERMINATION")).toBeVisible();
    await expect(page.getByText("Position settlement")).toBeVisible();
    await expect(page.getByText(/^\+\$\d+\.\d{2}$/).first()).toBeVisible();
  });

  test("Buy YES + outcome NO → loss path", async ({ page }) => {
    await mockCosmicApis(page, { outcome: "NO" });
    await runBetFlow(page, "YES", 50);

    await expect(page.getByText("Position settlement")).toBeVisible();
    // Net outcome on a loss is −$50.00 (minus sign is the Unicode "−" U+2212).
    await expect(page.getByText("−$50.00")).toBeVisible();
  });

  test("Buy NO + outcome YES → loss path", async ({ page }) => {
    await mockCosmicApis(page, { outcome: "YES" });
    await runBetFlow(page, "NO", 50);

    await expect(page.getByText("Position settlement")).toBeVisible();
    await expect(page.getByText("−$50.00")).toBeVisible();
  });

  test("direct navigation to a different market renders hero", async ({
    page,
  }) => {
    await mockCosmicApis(page);
    await page.goto("/market/agi-achieved-before-2030");
    await expect(
      page.getByRole("heading", { level: 1, name: /AGI/ }),
    ).toBeVisible();
    await expect(page.getByText("Order ticket")).toBeVisible();
  });
});
