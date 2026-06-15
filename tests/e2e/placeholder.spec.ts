import { expect, test } from "../../frontend/testing/playwright-test";

test.describe("PokeHabit", () => {
  test("fuehrt vom Login bis ins Quest-Board", async ({ page }) => {
    await page.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());

      if (url.pathname === "/api/auth/login") {
        await route.fulfill({ json: { message: "authenticated" } });
        return;
      }

      if (url.pathname === "/api/tasks") {
        await route.fulfill({
          json: [
            {
              id: 1,
              title: "Wasser trinken",
              description: "Quest aus dem Spielstand",
            },
            {
              id: 2,
              title: "30 Minuten lernen",
              description: "Quest aus dem Spielstand",
            },
          ],
        });
        return;
      }

      if (url.pathname === "/api/user/game-state") {
        await route.fulfill({
          json: {
            waterLevel: 500,
            foodLevel: 0,
            pokemonImageUrl: "/pet-placeholder.svg",
            pokemonLevel: 2,
            growth: 40,
            happiness: 55,
            pendingFeedPoints: 10,
            tasks: [
              { id: 1, title: "Wasser trinken", completed: true },
              { id: 2, title: "30 Minuten lernen", completed: false },
            ],
            streak: 2,
            yesterdayLoggedIn: true,
            serverNow: "2026-06-15T10:00:00Z",
          },
        });
        return;
      }

      await route.fulfill({ status: 404, json: { error: "not mocked" } });
    });

    await page.route("https://api.open-meteo.com/**", async (route) => {
      await route.fulfill({
        json: {
          current: {
            temperature_2m: 22,
            weather_code: 2,
            is_day: 1,
            time: "2026-06-15T10:00",
          },
        },
      });
    });

    await page.addInitScript(() => {
      globalThis.localStorage.clear();
    });

    await page.goto("/auth", { waitUntil: "domcontentloaded", timeout: 10000 });

    await page.getByLabel("Spielername").fill("demo");
    await page.getByLabel("Passwort").fill("cozyfocus");
    await page
      .getByRole("button", { name: "Einloggen und weitermachen" })
      .click();

    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: "Pokemon Quest Board" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tagesquests" })).toBeVisible();
    await expect(page.getByText("Tagesziel").first()).toBeVisible();
    await expect(page.getByText("Wasser trinken").first()).toBeVisible();
    await expect(page.getByText("500 ml", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Pokemon trainieren" }),
    ).toBeVisible();
  });
});
