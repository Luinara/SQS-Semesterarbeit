import { BackendApiService } from "../../../frontend/src/app/core/services/backend-api.service";

describe("BackendApiService", () => {
  it("meldet sich mit Backend-Spielername an und mappt API-Tasks in den Dashboard-State", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "authenticated" }))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            title: "Wasser trinken",
            description: "Aus Backend-Task-Tabelle",
          },
          { id: 2, title: "30 Minuten lernen", description: "API-Aufgabe" },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          waterLevel: 750,
          foodLevel: 18,
          pokemonImageUrl: "/assets/egg.png",
          pokemonName: "ivysaur",
          pokemonLevel: 4,
          growth: 35,
          happiness: 66,
          pendingFeedPoints: 7,
          tasks: [
            { id: 1, title: "Wasser trinken", completed: true },
            { id: 2, title: "30 Minuten lernen", completed: false },
          ],
          streak: 3,
          yesterdayLoggedIn: true,
          serverNow: "2026-06-15T10:00:00Z",
        }),
      );

    const snapshot = await new BackendApiService().login("zoe", "secret123");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/auth/login",
      expect.objectContaining({
        body: JSON.stringify({ username: "zoe", password: "secret123" }),
        credentials: "include",
        method: "POST",
      }),
    );
    expect(snapshot.user.userName).toBe("zoe");
    expect(snapshot.backendGameState.pokemonImageUrl).toBe("/assets/egg.png");
    expect(snapshot.gameState.tasks.map((task) => task.title)).toEqual([
      "Wasser trinken",
      "30 Minuten lernen",
    ]);
    expect(snapshot.gameState.tasks[0].isCompleted).toBe(true);
    expect(snapshot.gameState.pet.availableFoodPoints).toBe(7);
    expect(snapshot.gameState.pet.level).toBe(4);
    expect(snapshot.gameState.pet.starterPokemonSpecies).toBe("bulbasaur");
    expect(snapshot.gameState.pet.pokemonSpecies).toBe("ivysaur");
    expect(snapshot.gameState.qualityScore).toBe(10);
  });

  it("registriert den gewÃ¤hlten Starter und nutzt Backend-PokÃ©monnamen im Snapshot", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "created" }))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(
        jsonResponse({
          waterLevel: 0,
          foodLevel: 0,
          pokemonImageUrl: "/assets/egg.png",
          pokemonName: "charmeleon",
          pokemonLevel: 3,
          growth: 0,
          happiness: 0,
          pendingFeedPoints: 0,
          tasks: [],
          streak: 1,
          yesterdayLoggedIn: false,
          serverNow: "2026-06-15T10:00:00Z",
        }),
      );

    const snapshot = await new BackendApiService().signup({
      username: "zoe",
      password: "secret123",
      userName: "zoe",
      starterPokemonSpecies: "charmander",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/auth/signup",
      expect.objectContaining({
        body: JSON.stringify({
          username: "zoe",
          password: "secret123",
          starterPokemonId: 4,
        }),
        credentials: "include",
        method: "POST",
      }),
    );
    expect(snapshot.gameState.pet).toMatchObject({
      starterPokemonSpecies: "charmander",
      pokemonSpecies: "charmeleon",
      level: 3,
    });
  });

  it("lädt nach Task-Completion den frischen Game-State aus dem Backend", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(
        jsonResponse([{ id: 2, title: "30 Minuten lernen" }]),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          waterLevel: 0,
          foodLevel: 0,
          pokemonImageUrl: null,
          pokemonLevel: 1,
          growth: 10,
          happiness: 0,
          pendingFeedPoints: 20,
          tasks: [{ id: 2, title: "30 Minuten lernen", completed: true }],
          streak: 1,
          yesterdayLoggedIn: false,
          serverNow: "2026-06-15T10:00:00Z",
        }),
      );

    const snapshot = await new BackendApiService().completeTask("zoe", "2");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/tasks/2/complete",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/tasks",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/user/game-state",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(snapshot.gameState.tasks[0].isCompleted).toBe(true);
    expect(snapshot.gameState.pet.availableFoodPoints).toBe(20);
  });

  it("mappt Wasser-Autoabschluss inklusive Feed-Points nach addWater", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          waterLevel: 3000,
          foodLevel: 0,
          pokemonImageUrl: null,
          pokemonLevel: 1,
          growth: 10,
          happiness: 0,
          pendingFeedPoints: 10,
          tasks: [{ id: 1, title: "Wasser trinken", completed: true }],
          streak: 1,
          yesterdayLoggedIn: false,
          serverNow: "2026-06-15T10:00:00Z",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse([{ id: 1, title: "Wasser trinken" }]),
      );

    const snapshot = await new BackendApiService().addWater("zoe", 500);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/user/water",
      expect.objectContaining({
        body: JSON.stringify({ ml: 500 }),
        credentials: "include",
        method: "POST",
      }),
    );
    expect(snapshot.backendGameState.waterLevel).toBe(3000);
    expect(snapshot.gameState.tasks[0].isCompleted).toBe(true);
    expect(snapshot.gameState.pet.availableFoodPoints).toBe(10);
    expect(snapshot.gameState.qualityScore).toBe(10);
  });

  it("löst einen Test-Level-Up über die User-API aus und lädt Tasks nach", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          waterLevel: 0,
          foodLevel: 0,
          pokemonImageUrl: null,
          pokemonLevel: 8,
          growth: 0,
          happiness: 0,
          pendingFeedPoints: 0,
          tasks: [{ id: 2, title: "30 Minuten lernen", completed: false }],
          streak: 1,
          yesterdayLoggedIn: false,
          serverNow: "2026-06-15T10:00:00Z",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse([{ id: 2, title: "30 Minuten lernen" }]),
      );

    const snapshot = await new BackendApiService().testLevelUp("zoe");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/user/test-level-up",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
      }),
    );
    expect(snapshot.gameState.pet.level).toBe(8);
    expect(snapshot.gameState.pet.growthProgress).toBe(0);
  });

  it("zeigt bei HTML-Fehlerseiten eine kurze Server-Meldung statt Markup", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        "<!DOCTYPE html><html><body>404 fallback page</body></html>",
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
          status: 404,
        },
      ),
    );

    await expect(
      new BackendApiService().signup({
        username: "zoe",
        password: "secret123",
        userName: "zoe",
        starterPokemonSpecies: "bulbasaur",
      }),
    ).rejects.toMatchObject({
      status: 404,
      message:
        "Server nicht erreichbar. Bitte prüfe, ob die Verbindung aktiv ist.",
    });
  });

  it("löscht den Account über die User-API", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await new BackendApiService().deleteAccount();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/account",
      expect.objectContaining({
        credentials: "include",
        method: "DELETE",
      }),
    );
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}
