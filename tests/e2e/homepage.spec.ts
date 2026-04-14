import { expect, test } from "@playwright/test";
import markets from "../../data/markets.json";

const featured = markets.find(
  (m) => m.featured && !m.resolved,
) as (typeof markets)[number];

// Escape a string for use inside a RegExp.
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const featuredQuestionRegex = new RegExp(esc(featured.question));

test.describe("homepage", () => {
  test("renders navbar with logo and default balance", async ({ page }) => {
    await page.goto("/");

    // Logo text
    await expect(
      page.getByRole("link", { name: /Cosmic Forecast/ }),
    ).toBeVisible();

    // Balance pill in navbar — RollingNumber renders integer 1000 as "$1000" (no comma).
    // The pill is a link to /wallet.
    const balancePill = page.getByRole("link", { name: /\$1000/ });
    await expect(balancePill).toBeVisible();
  });

  test("renders featured hero with the expected question", async ({ page }) => {
    await page.goto("/");

    const hero = page.getByRole("heading", {
      level: 2,
      name: featuredQuestionRegex,
    });
    await expect(hero).toBeVisible();
  });

  test("hero chart renders svg and yes/no legend", async ({ page }) => {
    await page.goto("/");

    // Scope to the card that contains the featured h2, then find the svg inside.
    const heroHeading = page.getByRole("heading", {
      level: 2,
      name: featuredQuestionRegex,
    });
    const heroCard = heroHeading.locator(
      "xpath=ancestor::div[contains(@class, 'rounded-2xl')][1]",
    );
    await expect(heroCard.locator("svg").first()).toBeVisible();

    // Legend is within the same card.
    await expect(heroCard.getByText(/Yes \d+%/).first()).toBeVisible();
    await expect(heroCard.getByText(/No \d+%/).first()).toBeVisible();
  });

  test("category filter narrows the market grid", async ({ page }) => {
    await page.goto("/");

    // Wait for initial hydration + grid render.
    await expect(
      page.getByRole("heading", { level: 2, name: featuredQuestionRegex }),
    ).toBeVisible();

    // Grid cards use <h3> for the market question; sidebar uses <p>,
    // so scoping by heading level isolates the grid.
    const trumpRegex = /Trump win the 2028 presidential election/;
    const trumpGridCard = page.getByRole("heading", {
      level: 3,
      name: trumpRegex,
    });

    // "Politics" — Trump market should show in the grid.
    const politicsTab = page.getByRole("button", { name: /^Politics$/ });
    await politicsTab.click();
    // Gate on the active-tab class so the next click doesn't race the
    // re-render triggered by this one.
    await expect(politicsTab).toHaveClass(/bg-blue-600/);
    await expect(trumpGridCard).toBeVisible();

    // "Sports" — Trump market gone from grid (may still exist in sidebar).
    const sportsTab = page.getByRole("button", { name: /^Sports$/ });
    await sportsTab.click();
    await expect(sportsTab).toHaveClass(/bg-blue-600/);
    await expect(trumpGridCard).toHaveCount(0);
  });

  test("clicking the featured hero navigates to the market page", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("heading", { level: 2, name: featuredQuestionRegex })
      .click();

    await expect(page).toHaveURL(new RegExp(`/market/${featured.id}`));
    await expect(
      page.getByRole("heading", { level: 1, name: featuredQuestionRegex }),
    ).toBeVisible();
  });
});
