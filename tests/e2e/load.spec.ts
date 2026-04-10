import { expect, test } from "@playwright/test";
import markets from "../../data/markets.json";
import { mockCosmicApis } from "../fixtures/mocks";

const featured = markets.find(
  (m) => m.featured && !m.resolved,
) as (typeof markets)[number];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const featuredQuestionRegex = new RegExp(esc(featured.question));

// This file is excluded from `bun run test` (the default script uses
// --grep-invert "30 concurrent") because 30 concurrent contexts hitting the
// Next.js dev server can overwhelm it and cause flakes in other specs that
// run in parallel. Run it alone with `bun run test:load`.
test.describe.configure({ mode: "serial" });

test("30 concurrent clients complete the bet flow", async ({ browser }) => {
  test.setTimeout(180_000);
  const N = 30;

  const runs = Array.from({ length: N }, async (_, i) => {
    const side: "YES" | "NO" = i % 2 === 0 ? "YES" : "NO";
    const outcome: "YES" | "NO" = i % 3 === 0 ? "NO" : "YES";

    const sideSelectorRegex =
      side === "YES" ? /^Buy Yes \d+¢$/ : /^Buy No \d+¢$/;
    const actionButtonRegex = side === "YES" ? /^Buy YES$/ : /^Buy NO$/;

    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    try {
      await mockCosmicApis(page, { outcome });
      await page.goto("/");
      await page
        .getByRole("heading", { level: 2, name: featuredQuestionRegex })
        .click();
      await page
        .getByRole("button", { name: sideSelectorRegex })
        .first()
        .click();
      await page.getByRole("spinbutton").first().fill("10");
      await page
        .getByRole("button", { name: actionButtonRegex })
        .first()
        .click();

      const speedUp = page.getByRole("button", { name: "Speed Up Time" });
      await expect(speedUp).toBeVisible({ timeout: 12_000 });
      await speedUp.click();

      await expect(page.getByText("Cosmic Analysis Report")).toBeVisible({
        timeout: 30_000,
      });
    } finally {
      await ctx.close();
    }
  });

  const results = await Promise.allSettled(runs);
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    for (const f of failed) {
      console.error((f as PromiseRejectedResult).reason);
    }
  }
  expect(failed, `${failed.length}/${N} clients failed`).toHaveLength(0);
});
