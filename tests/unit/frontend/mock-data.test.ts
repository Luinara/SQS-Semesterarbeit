import {
  calculateNextGrowthGoal,
  createInitialGameState,
  createInitialSnapshot,
  PET_RULES,
  QUALITY_RULES,
  normalizeEmail,
  resolvePokemonSpeciesForLevel,
} from "../../../frontend/src/app/shared/mock/mock-data";

describe("mock-data", () => {
  it("normalisiert E-Mail-Adressen fuer stabile Vergleiche", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("berechnet das naechste Wachstumsziel nachvollziehbar groesser", () => {
    expect(calculateNextGrowthGoal(100)).toBe(123);
    expect(calculateNextGrowthGoal(123)).toBeGreaterThan(123);
  });

  it("stellt einen initialen Snapshot mit Demo-Account bereit", () => {
    const snapshot = createInitialSnapshot();

    expect(snapshot.accounts).toHaveLength(1);
    expect(snapshot.activeUserId).toBeNull();
    expect(snapshot.accounts[0].user.userName).toBe("Lina");
  });

  it("liefert einen neuen Quality-Spielzustand mit offenen Checklistenpunkten", () => {
    const gameState = createInitialGameState();

    expect(gameState.tasks).toHaveLength(10);
    expect(gameState.tasks.every((task) => !task.isCompleted)).toBe(true);
    expect(gameState.tasks.every((task) => task.checklistReference.length > 0)).toBe(true);
    expect(gameState.qualityTarget).toBe(QUALITY_RULES.targetScore);
    expect(gameState.pet.level).toBe(1);
    expect(gameState.pet.pokemonSpecies).toBe("bulbasaur");
  });

  it("nutzt ein ganzzahliges, klares Quality-Balancing", () => {
    const gameState = createInitialGameState();
    const taskPoints = gameState.tasks.map((task) => task.points);

    expect(taskPoints).toEqual([8, 10, 10, 12, 14, 12, 10, 8, 8, 8]);
    expect(taskPoints.every(Number.isInteger)).toBe(true);
    expect(Number.isInteger(PET_RULES.feedCost)).toBe(true);
    expect(Number.isInteger(PET_RULES.growthPerFeeding)).toBe(true);
    expect(Number.isInteger(PET_RULES.happinessPerFeeding)).toBe(true);
  });

  it("leitet die Pokemon-Stufe aus dem Level ab", () => {
    expect(resolvePokemonSpeciesForLevel(1)).toBe("bulbasaur");
    expect(resolvePokemonSpeciesForLevel(3)).toBe("ivysaur");
    expect(resolvePokemonSpeciesForLevel(6)).toBe("venusaur");
  });
});
