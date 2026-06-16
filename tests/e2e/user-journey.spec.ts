import { expect, test } from "../../frontend/testing/playwright-test";

const tasks = [
  {
    id: 1,
    title: "Wasser trinken",
    description: "Trinke heute 3 Liter Wasser.",
  },
  {
    id: 2,
    title: "30 Minuten lernen",
    description: "Ein fokussierter Lernblock für dein Pokémon.",
  },
];

test.describe("PokeHabit", () => {
  test("führt vom Login durch Quest, Wasser, Training und Logout", async ({
    page,
  }, testInfo) => {
    const completions = new Map<number, boolean>([
      [1, false],
      [2, false],
    ]);
    const gameState = {
      waterLevel: 500,
      foodLevel: 0,
      pokemonImageUrl: "/pet-placeholder.svg",
      pokemonLevel: 2,
      growth: 40,
      happiness: 55,
      pendingFeedPoints: 10,
      streak: 2,
      yesterdayLoggedIn: true,
      serverNow: "2026-06-15T10:00:00Z",
    };

    await page.route("**/api/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (url.pathname === "/api/auth/login") {
        await route.fulfill({ json: { message: "authenticated" } });
        return;
      }

      if (url.pathname === "/api/auth/logout") {
        await route.fulfill({ json: { message: "logged out" } });
        return;
      }

      if (url.pathname === "/api/tasks") {
        await route.fulfill({ json: tasks });
        return;
      }

      if (url.pathname === "/api/user/game-state") {
        await route.fulfill({ json: createGameState(gameState, completions) });
        return;
      }

      if (url.pathname === "/api/user/water") {
        const body = (await request.postDataJSON()) as { ml: number };
        gameState.waterLevel += body.ml;

        if (gameState.waterLevel >= 3000 && !completions.get(1)) {
          completions.set(1, true);
          gameState.pendingFeedPoints += 10;
          gameState.growth += 10;
        }

        await route.fulfill({ json: createGameState(gameState, completions) });
        return;
      }

      if (url.pathname === "/api/tasks/2/complete") {
        completions.set(2, true);
        gameState.pendingFeedPoints += 20;
        gameState.growth += 10;
        await route.fulfill({ json: { success: true } });
        return;
      }

      if (url.pathname === "/api/user/feed") {
        gameState.pendingFeedPoints -= 1;
        gameState.happiness += 1;
        await route.fulfill({ json: createGameState(gameState, completions) });
        return;
      }

      if (url.pathname === "/api/user/test-level-up") {
        gameState.pokemonLevel += 1;
        gameState.growth = 0;
        await route.fulfill({ json: createGameState(gameState, completions) });
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

    await page.route("https://pokeapi.co/**", async (route) => {
      await route.fulfill({
        json: {
          id: 2,
          name: "ivysaur",
          sprites: {
            other: {
              "official-artwork": {
                front_default: "/pet-placeholder.svg",
              },
            },
          },
          types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
        },
      });
    });

    await page.addInitScript(() => {
      globalThis.localStorage.clear();
    });

    await page.goto("/auth", { waitUntil: "domcontentloaded", timeout: 10000 });

    await page.getByLabel("Spielername").fill("demo");
    await page.getByLabel("Passwort").fill("password123");
    await page
      .getByRole("button", { name: "Einloggen und weitermachen" })
      .click();

    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: "Pokémon Quest Board" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tagesquests" }),
    ).toBeVisible();
    await expect(page.getByText("500 / 3000 ml")).toBeVisible();

    await page
      .locator("sqs-task-card")
      .filter({ hasText: "30 Minuten lernen" })
      .getByRole("button", { name: "Erledigen" })
      .click();
    await expect(
      page.getByText("Quest erledigt. Dein Spielstand wurde aktualisiert."),
    ).toBeVisible();

    await page.getByRole("button", { name: "+500 ml" }).click();
    await expect(page.getByText("1000 / 3000 ml")).toBeVisible();
    await expect(page.getByText("+500 ml Wasser getrunken.")).toBeVisible();

    await page
      .getByRole("button", { name: "Pokémon trainieren", exact: true })
      .click();
    await expect(
      page.getByText("Trainingspunkte wurden für dein Pokémon eingesetzt."),
    ).toBeVisible();

    await page.getByRole("button", { name: "Level-Up testen" }).click();
    await expect(page.getByText("Level-Up auf 3.")).toBeVisible();

    await testInfo.attach("Demo-Screenshot nach Training", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    await page.getByRole("button", { name: "Abmelden" }).click();
    await page.waitForURL("**/auth");
  });
});

function createGameState(
  gameState: {
    waterLevel: number;
    foodLevel: number;
    pokemonImageUrl: string;
    pokemonLevel: number;
    growth: number;
    happiness: number;
    pendingFeedPoints: number;
    streak: number;
    yesterdayLoggedIn: boolean;
    serverNow: string;
  },
  completions: Map<number, boolean>,
) {
  return {
    ...gameState,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      completed: completions.get(task.id) ?? false,
    })),
  };
}
