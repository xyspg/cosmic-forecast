import type { Page } from "@playwright/test";

export async function mockCosmicApis(
  page: Page,
  opts: { outcome?: "YES" | "NO" } = {},
) {
  const outcome = opts.outcome ?? "YES";

  await page.route("**/api/resolve-bet", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        outcome,
        hash: "a".repeat(64),
        nasaEventId: "FLR-TEST-2026-04-10T00:00-001",
        nasaEventType: "Solar Flare",
        nasaEvent: {
          id: "FLR-TEST-2026-04-10T00:00-001",
          type: "Solar Flare",
          classType: "M2.1",
          sourceLocation: "N23W45",
        },
        marketQuestion: "mocked",
        date: "2026-04-10",
        explanation:
          "Analysis of the detected solar flare reveals an M-class electromagnetic signature whose spectral decomposition exhibits clear directional bias. [MOCKED]",
      }),
    });
  });
}
