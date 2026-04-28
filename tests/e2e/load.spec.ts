import { expect, test } from "@playwright/test";

import markets from "../../data/markets.json";
import { mockCosmicApis } from "../fixtures/mocks";

const featured = markets.find((m) => m.featured && !m.resolved) as (typeof markets)[number];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const featuredQuestionRegex = new RegExp(esc(featured.question));

// Excluded from `bun run test` via --grep-invert "30 concurrent" — 30
// concurrent contexts against the Next.js dev server can trip other specs'
// timeouts. Run alone with `bun run test:load`.
test.describe.configure({ mode: "serial" });

test("30 concurrent clients complete the bet flow", async ({ browser }) => {
  test.setTimeout(180_000);
  const N = 30;

  const runs = Array.from({ length: N }, async (_, i) => {
    const side: "YES" | "NO" = i % 2 === 0 ? "YES" : "NO";
    const outcome: "YES" | "NO" = i % 3 === 0 ? "NO" : "YES";
    const amount = 10;

    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    try {
      await mockCosmicApis(page, { outcome });
      await page.goto("/");

      await page.getByRole("heading", { level: 1, name: featuredQuestionRegex }).click();

      await page
        .getByRole("button", { name: new RegExp(`^${side} \\d+¢$`) })
        .first()
        .click();

      await page.locator('input[inputmode="decimal"]').first().fill(String(amount));

      await page
        .getByRole("button", {
          name: new RegExp(`^Submit ${side} order · \\$${amount}\\.00$`),
        })
        .click();

      const speedUp = page.getByRole("button", { name: /Engage time dilation/i });
      await expect(speedUp).toBeVisible({ timeout: 12_000 });
      await speedUp.click();

      await expect(page).toHaveURL(new RegExp(`/resolution/${featured.id}`), {
        timeout: 30_000,
      });
      await expect(page.getByText("FINAL DETERMINATION")).toBeVisible();
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
