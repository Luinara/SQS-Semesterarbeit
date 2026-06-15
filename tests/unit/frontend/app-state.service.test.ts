import { AppStateService } from "../../../frontend/src/app/core/services/app-state.service";
import { DashboardSnapshot } from "../../../frontend/src/app/core/services/backend-api.service";
import { GameState } from "../../../frontend/src/app/shared/models/app-state.model";
import { AppUser } from "../../../frontend/src/app/shared/models/user.model";

describe("AppStateService", () => {
  it("triggert Level-Up-Feedback und Animation, wenn ein Backend-Snapshot ein hoeheres Level liefert", async () => {
    vi.useFakeTimers();
    const backendApi = createBackendApiMock([
      createSnapshot(1, 90),
      createSnapshot(2, 0),
    ]);
    const service = new AppStateService(backendApi);

    await service.login({ username: "mira", password: "password123" });
    await service.completeTask("2");

    expect(service.lastGameFeedback()?.kind).toBe("level-up");
    expect(service.isPetLevelingUp()).toBe(true);

    vi.advanceTimersByTime(1200);

    expect(service.isPetLevelingUp()).toBe(false);
    vi.useRealTimers();
  });

  it("triggert keine Animation, wenn das Level gleich bleibt", async () => {
    vi.useFakeTimers();
    const backendApi = createBackendApiMock([
      createSnapshot(1, 20),
      createSnapshot(1, 30),
    ]);
    const service = new AppStateService(backendApi);

    await service.login({ username: "mira", password: "password123" });
    await service.completeTask("2");

    expect(service.lastGameFeedback()?.kind).toBe("quest");
    expect(service.isPetLevelingUp()).toBe(false);
    vi.useRealTimers();
  });
});

function createBackendApiMock(snapshots: DashboardSnapshot[]) {
  return {
    login: vi.fn().mockResolvedValue(snapshots[0]),
    completeTask: vi.fn().mockResolvedValue(snapshots[1]),
  } as unknown as ConstructorParameters<typeof AppStateService>[0];
}

function createSnapshot(level: number, growth: number): DashboardSnapshot {
  const user: AppUser = {
    id: "mira",
    email: "mira",
    userName: "mira",
    joinedAt: "2026-06-15T10:00:00Z",
  };
  const gameState: GameState = {
    pet: {
      name: "Pokemon Partner",
      level,
      growthProgress: growth,
      growthGoal: 100,
      availableFoodPoints: 0,
      happiness: 0,
      hunger: 0,
      hearts: 5,
      mealsServed: 0,
      dailyHappinessGained: 0,
      happinessGainLastResetAt: "2026-06-15T10:00:00Z",
      lastFedAt: null,
      lastHappinessDecayAt: null,
      lastLevelUpAt: null,
      goodCareStreakDays: 0,
      lastGoodCareDay: null,
      pokemonSpecies: "bulbasaur",
    },
    tasks: [
      {
        id: "2",
        title: "Lesen",
        description: "Ein paar Seiten lesen.",
        icon: "docs",
        tone: "green",
        category: "delivery",
        isRequired: true,
        checklistReference: "Quest #2",
        points: 10,
        isCompleted: level > 1,
      },
    ],
    qualityScore: level > 1 ? 10 : 0,
    qualityTarget: 10,
    qualityLastResetAt: "2026-06-15T10:00:00Z",
    dailyQuestLastResetAt: "2026-06-15T10:00:00Z",
    totalCompletedTasks: level > 1 ? 1 : 0,
    totalEarnedPoints: level > 1 ? 10 : 0,
  };

  return {
    user,
    gameState,
    backendGameState: {
      waterLevel: 0,
      foodLevel: 0,
      pokemonImageUrl: "/assets/egg.png",
      pokemonLevel: level,
      growth,
      happiness: 0,
      pendingFeedPoints: 0,
      tasks: [{ id: 2, title: "Lesen", completed: level > 1 }],
      streak: 1,
      yesterdayLoggedIn: false,
      serverNow: "2026-06-15T10:00:00Z",
    },
  };
}
