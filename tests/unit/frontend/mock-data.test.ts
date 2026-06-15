import {
  calculateNextGrowthGoal,
  createInitialGameState,
  createInitialSnapshot,
  PET_RULES,
  normalizeEmail,
} from "../../../frontend/src/app/shared/mock/mock-data";

describe("mock-data", () => {
  it("normalisiert E-Mail-Adressen für stabile Vergleiche", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("berechnet das nächste Wachstumsziel nachvollziehbar größer", () => {
    expect(calculateNextGrowthGoal(100)).toBe(123);
    expect(calculateNextGrowthGoal(123)).toBeGreaterThan(123);
  });

  it("stellt einen initialen Snapshot mit Demo-Account bereit", () => {
    const snapshot = createInitialSnapshot();

    expect(snapshot.accounts).toHaveLength(1);
    expect(snapshot.activeUserId).toBeNull();
    expect(snapshot.accounts[0].user.userName).toBe("Lina");
  });

  it("liefert einen neuen Spielzustand mit offenen Aufgaben", () => {
    const gameState = createInitialGameState();

    expect(gameState.tasks).toHaveLength(5);
    expect(gameState.tasks.every((task) => !task.isCompleted)).toBe(true);
    expect(gameState.pet.level).toBe(1);
  });

  it("nutzt ein ganzzahliges, klares Punkte-Balancing", () => {
    const gameState = createInitialGameState();
    const taskPoints = gameState.tasks.map((task) => task.points);

    expect(taskPoints).toEqual([10, 20, 20, 15, 10]);
    expect(taskPoints.every(Number.isInteger)).toBe(true);
    expect(Number.isInteger(PET_RULES.feedCost)).toBe(true);
    expect(Number.isInteger(PET_RULES.growthPerFeeding)).toBe(true);
    expect(Number.isInteger(PET_RULES.happinessPerFeeding)).toBe(true);
  });
});
