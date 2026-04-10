import { expect, type Page, test } from "@playwright/test";
import markets from "../../data/markets.json";
import { mockCosmicApis } from "../fixtures/mocks";

const featured = markets.find(
  (m) => m.featured && !m.resolved,
) as (typeof markets)[number];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const featuredQuestionRegex = new RegExp(esc(featured.question));

async function runBetFlow(
  page: Page,
  side: "YES" | "NO",
  amount: number,
): Promise<void> {
  await page.goto("/");

  await page
    .getByRole("heading", { level: 2, name: featuredQuestionRegex })
    .click();

  await expect(page).toHaveURL(new RegExp(`/market/${featured.id}`));

  // BettingPanel renders two buttons per side:
  //   side selector: "Buy Yes 34¢" / "Buy No 66¢"  (case + ¢ matter)
  //   action button: "Buy YES" / "Buy NO"
  const sideSelectorRegex = side === "YES" ? /^Buy Yes \d+¢$/ : /^Buy No \d+¢$/;
  const actionButtonRegex = side === "YES" ? /^Buy YES$/ : /^Buy NO$/;

  // BettingPanel is duplicated on the page (mobile + desktop layouts).
  // `.first()` picks whichever renders first in DOM order — either works
  // since both panels share store state.
  await page.getByRole("button", { name: sideSelectorRegex }).first().click();

  // BettingPanel's amount <label> isn't associated via htmlFor, so use the
  // "spinbutton" role that <input type="number"> exposes.
  await page.getByRole("spinbutton").first().fill(String(amount));
  await page.getByRole("button", { name: actionButtonRegex }).first().click();

  // Skip checking the "Your position" intermediate text — there are two
  // panels (mobile + desktop) and the mobile one is display:none at desktop
  // widths, confusing getByText's strict-mode selection. The SpeedUpOverlay
  // button appearing is already a strong signal the bet went through.

  // SpeedUpOverlay opens after a 2s setTimeout. Button fades in ~1.4s later
  // via motion/react, but Playwright's click actionability ignores opacity.
  const speedUp = page.getByRole("button", { name: "Speed Up Time" });
  await expect(speedUp).toBeVisible({ timeout: 8_000 });
  await speedUp.click();

  // Warp animation intervals sum to ~5.6s, then CosmicReport renders.
  await expect(page.getByText("Cosmic Analysis Report")).toBeVisible({
    timeout: 20_000,
  });
}

// Verdict is rendered as a sibling span of the "Cosmic Verdict" label.
// CosmicReport is only mounted once, so no visibility scoping needed.
function verdictLocator(page: Page) {
  return page
    .getByText("Cosmic Verdict", { exact: true })
    .locator("xpath=following-sibling::span[1]");
}

// BettingPanel is duplicated (mobile + desktop). The mobile copy is
// display:none at the desktop viewport, so filter to visible elements
// before asserting on strings that appear in both panels.
const visible = { visible: true } as const;

test.describe("main bet flow", () => {
  test("Buy YES + outcome YES → win", async ({ page }) => {
    await mockCosmicApis(page, { outcome: "YES" });
    await runBetFlow(page, "YES", 25);

    await expect(
      page.getByText("You won this market.").filter(visible),
    ).toBeVisible();
    await expect(page.getByText(/\[MOCKED\]/)).toBeVisible();
    await expect(verdictLocator(page)).toHaveText("YES");

    // Balance: 1000 - 25 + 25/0.34 ≈ 1048.53 → RollingNumber renders "$1048.53"
    // (no thousands separator). Use a regex to tolerate minor price drift.
    await expect(page.locator("header")).toContainText(/\$104\d\.\d{2}/);
  });

  test("Buy NO + outcome NO → win", async ({ page }) => {
    await mockCosmicApis(page, { outcome: "NO" });
    await runBetFlow(page, "NO", 25);

    await expect(
      page.getByText("You won this market.").filter(visible),
    ).toBeVisible();
    await expect(verdictLocator(page)).toHaveText("NO");
  });

  test("Buy YES + outcome NO → loss", async ({ page }) => {
    await mockCosmicApis(page, { outcome: "NO" });
    await runBetFlow(page, "YES", 50);

    await expect(
      page.getByText("The cosmos ruled against you.").filter(visible),
    ).toBeVisible();
    // P&L is negative — BettingPanel renders it as "$-50.00" (the "$" is a
    // literal prefix followed by the signed number).
    await expect(page.getByText(/\$-50\.00/).filter(visible)).toBeVisible();
    // Balance drops to 950 (integer → "$950", no decimals).
    await expect(page.locator("header")).toContainText("$950");
  });

  test("Buy NO + outcome YES → loss", async ({ page }) => {
    await mockCosmicApis(page, { outcome: "YES" });
    await runBetFlow(page, "NO", 50);

    await expect(
      page.getByText("The cosmos ruled against you.").filter(visible),
    ).toBeVisible();
    await expect(page.locator("header")).toContainText("$950");
  });

  test("direct navigation to a different market page renders", async ({
    page,
  }) => {
    await mockCosmicApis(page);
    await page.goto("/market/agi-achieved-before-2030");
    await expect(
      page.getByRole("heading", { level: 1, name: /AGI/ }),
    ).toBeVisible();
  });
});
