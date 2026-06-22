import type { Page, Response } from "@playwright/test";
import { expect, test } from "../../frontend/testing/playwright-test";

test.describe("PokeHabit fullstack smoke", () => {
  test.skip(
    process.env.PLAYWRIGHT_FULLSTACK !== "1",
    "Runs only against the Docker app stack with the real /api proxy enabled.",
  );

  test("persists signup, session cookie and water progress through the Docker stack", async ({
    context,
    page,
  }, testInfo) => {
    test.setTimeout(60_000);

    const username = `fullstack-${Date.now()}-${testInfo.workerIndex}`;
    const password = "password123";

    await mockExternalBrowserApis(page);

    await page.goto("/auth", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.getByRole("tab", { name: "Registrieren" }).click();
    await expect(
      page.getByRole("heading", { name: "Lege dein Spielerprofil an" }),
    ).toBeVisible();
    await page.locator("#username").fill(username);
    await page.locator("#password").fill(password);
    await expect(page.locator("#username")).toHaveValue(username);
    await expect(page.locator("#password")).toHaveValue(password);

    const signupResponsePromise = page.waitForResponse((response) =>
      hasPath(response, "/api/auth/signup"),
    );
    await page
      .getByRole("button", { name: "Profil anlegen und starten" })
      .click();
    const signupResponse = await signupResponsePromise;

    expect(signupResponse.status()).toBe(201);
    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: /Pok.mon Quest Board/ }),
    ).toBeVisible();
    await expect(page.getByText(username)).toBeVisible();
    await expect(page.getByText("0 / 3000 ml")).toBeVisible();

    const cookies = await context.cookies();
    expect(cookies.some((cookie) => cookie.name === "JSESSIONID")).toBe(true);

    const waterResponsePromise = page.waitForResponse((response) =>
      hasPath(response, "/api/user/water"),
    );
    await page.getByRole("button", { name: "+500 ml" }).click();
    const waterResponse = await waterResponsePromise;

    expect(waterResponse.status()).toBe(200);
    await expect(page.getByText("500 / 3000 ml")).toBeVisible();

    const reloadGameStatePromise = page.waitForResponse((response) =>
      hasPath(response, "/api/user/game-state"),
    );
    await page.reload({ waitUntil: "domcontentloaded" });
    const reloadGameState = await reloadGameStatePromise;

    expect(reloadGameState.status()).toBe(200);
    await expect(page.getByText(username)).toBeVisible();
    await expect(page.getByText("500 / 3000 ml")).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    const deleteResponsePromise = page.waitForResponse((response) =>
      hasPath(response, "/api/user/account"),
    );
    await page.getByRole("button", { name: /Profil l.schen/ }).click();
    const deleteResponse = await deleteResponsePromise;

    expect(deleteResponse.status()).toBe(204);
    await page.waitForURL("**/auth");
  });
});

async function mockExternalBrowserApis(page: Page): Promise<void> {
  await page.route("**/api/weather/location**", async (route) => {
    await route.fulfill({
      json: {
        latitude: 52.52,
        longitude: 13.41,
        label: "Berlin, Berlin, Deutschland",
      },
    });
  });

  await page.route("**/api/weather/current**", async (route) => {
    await route.fulfill({
      json: {
        condition: "cloudy",
        timeOfDay: "day",
        temperatureC: 21,
        weatherCode: 1,
        label: "Bewoelkt",
        locationLabel: "Berlin, Berlin, Deutschland",
        updatedAt: "2026-06-15T10:00:00Z",
      },
    });
  });

  await page.route("https://api.open-meteo.com/**", async (route) => {
    await route.fulfill({
      json: {
        current: {
          temperature_2m: 21,
          weather_code: 1,
          is_day: 1,
          time: "2026-06-15T10:00",
        },
      },
    });
  });

  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    await route.fulfill({
      json: {
        results: [
          {
            name: "Berlin",
            admin1: "Berlin",
            country: "Deutschland",
            feature_code: "PPLC",
            latitude: 52.52,
            longitude: 13.41,
            population: 3_700_000,
          },
        ],
      },
    });
  });

  await page.route("https://pokeapi.co/**", async (route) => {
    await route.fulfill({
      json: {
        id: 7,
        name: "squirtle",
        sprites: {
          other: {
            "official-artwork": {
              front_default:
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
            },
          },
        },
        types: [{ type: { name: "water" } }],
      },
    });
  });
}

function hasPath(response: Response, pathname: string): boolean {
  return new URL(response.url()).pathname === pathname;
}
