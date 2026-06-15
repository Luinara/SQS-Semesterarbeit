import {
  canCompleteTaskInGameState,
  calculateQualityScore,
  completeTaskInGameState,
  completeTaskInGameStateWithFeedback,
  createRegisteredAccount,
  derivePetCareState,
  feedPetInGameState,
  feedPetInGameStateWithFeedback,
  findAccountForLogin,
  hasAccountWithEmail,
  isQualityGateReached,
  resetDailyProgressIfExpired,
  resetGameState,
} from "../../../frontend/src/app/core/state/app-state.logic";
import {
  createInitialGameState,
  createInitialSnapshot,
  PET_RULES,
} from "../../../frontend/src/app/shared/mock/mock-data";

describe("app-state.logic", () => {
  it("meldet den Demo-Account auch mit gemischter Schreibweise des Usernames an", () => {
    const snapshot = createInitialSnapshot();

    const account = findAccountForLogin(snapshot.accounts, {
      username: "  DEMO ",
      password: "cozyfocus",
    });

    expect(account?.user.userName).toBe("demo");
  });

  it("erkennt vorhandene Konten unabhaengig von Gross- und Kleinschreibung", () => {
    const snapshot = createInitialSnapshot();

    expect(hasAccountWithEmail(snapshot.accounts, " Demo ")).toBe(true);
    expect(hasAccountWithEmail(snapshot.accounts, "neu@sqs.app")).toBe(false);
  });

  it("erstellt neue Konten mit bereinigten Eingaben und frischem Task-State", () => {
    const account = createRegisteredAccount({
      username: "  TEST ",
      password: "geheim123",
      userName: "  Mira  ",
    });

    expect(account.user.email).toBe("test");
    expect(account.user.userName).toBe("Mira");
    expect(account.gameState.tasks).toHaveLength(5);
    expect(account.gameState.qualityScore).toBe(0);
    expect(account.gameState.pet.level).toBe(1);
  });

  it("markiert eine Quest als erledigt und schreibt Punkte gut", () => {
    const initialGameState = createInitialGameState();
    const firstTask = initialGameState.tasks[0];

    const updatedGameState = completeTaskInGameState(initialGameState, firstTask.id);

    expect(updatedGameState.tasks[0].isCompleted).toBe(true);
    expect(updatedGameState.totalCompletedTasks).toBe(1);
    expect(updatedGameState.totalEarnedPoints).toBe(firstTask.points);
    expect(updatedGameState.pet.availableFoodPoints).toBe(firstTask.points);
    expect(updatedGameState.qualityScore).toBe(firstTask.points);
  });

  it("laesst einen bereits erledigten Task beim zweiten Versuch unveraendert", () => {
    const initialGameState = createInitialGameState();
    const firstTaskId = initialGameState.tasks[0].id;

    const onceCompleted = completeTaskInGameState(initialGameState, firstTaskId);
    const twiceCompleted = completeTaskInGameState(onceCompleted, firstTaskId);

    expect(twiceCompleted).toEqual(onceCompleted);
  });

  it("berechnet und erkennt das Tagesziel aus Quests", () => {
    let gameState = createInitialGameState();

    for (const task of gameState.tasks) {
      gameState = completeTaskInGameState(gameState, task.id);
    }

    expect(calculateQualityScore(gameState.tasks)).toBe(75);
    expect(isQualityGateReached(gameState)).toBe(true);
  });

  it("liefert beim Erreichen des Tagesziels Level-Up-Feedback", () => {
    let gameState = createInitialGameState();

    for (const task of gameState.tasks.slice(0, 4)) {
      gameState = completeTaskInGameState(gameState, task.id);
    }

    const result = completeTaskInGameStateWithFeedback(gameState, gameState.tasks[4].id);

    expect(result.gameState.qualityScore).toBe(75);
    expect(result.feedback?.kind).toBe("level-up");
  });

  it("trainiert das Pokemon nur, wenn genug Quest-Punkte vorhanden sind", () => {
    const initialGameState = createInitialGameState();

    const result = feedPetInGameStateWithFeedback(initialGameState);

    expect(result.gameState).toEqual(initialGameState);
    expect(result.feedback?.kind).toBe("info");
  });

  it("erhoeht Motivation beim Training, aber nur bis zum Tageslimit", () => {
    const initialGameState = createInitialGameState();
    let gameState = {
      ...initialGameState,
      pet: {
        ...initialGameState.pet,
        availableFoodPoints: 100,
      },
    };

    for (let index = 0; index < 6; index += 1) {
      gameState = feedPetInGameState(gameState);
    }

    expect(gameState.pet.happiness).toBe(PET_RULES.dailyHappinessGainLimit);
    expect(gameState.pet.dailyHappinessGained).toBe(PET_RULES.dailyHappinessGainLimit);
  });

  it("levelt direkt bei vollem Wachstum und aktualisiert die Pokemon-Stufe", () => {
    const initialGameState = createInitialGameState();
    const preparedGameState = {
      ...initialGameState,
      pet: {
        ...initialGameState.pet,
        availableFoodPoints: 24,
        growthProgress: 80,
        growthGoal: 100,
        happiness: 70,
      },
    };

    const updatedGameState = feedPetInGameState(preparedGameState);

    expect(updatedGameState.pet.level).toBe(2);
    expect(updatedGameState.pet.growthProgress).toBe(14);
    expect(updatedGameState.pet.growthGoal).toBe(123);
    expect(updatedGameState.pet.pokemonSpecies).toBe("bulbasaur");
    expect(updatedGameState.pet.availableFoodPoints).toBe(24 - PET_RULES.feedCost);
  });

  it("wechselt ab Level 3 zu Ivysaur und ab Level 6 zu Venusaur", () => {
    const initialGameState = createInitialGameState();
    const levelTwoState = {
      ...initialGameState,
      pet: {
        ...initialGameState.pet,
        level: 2,
        availableFoodPoints: 40,
        growthProgress: 100,
        growthGoal: 100,
      },
    };
    const levelFiveState = {
      ...initialGameState,
      pet: {
        ...initialGameState.pet,
        level: 5,
        availableFoodPoints: 40,
        growthProgress: 100,
        growthGoal: 100,
      },
    };

    expect(feedPetInGameState(levelTwoState).pet.pokemonSpecies).toBe("ivysaur");
    expect(feedPetInGameState(levelFiveState).pet.pokemonSpecies).toBe("venusaur");
  });

  it("setzt das Demo-Spiel auf leere Quest-Werte zurueck", () => {
    const resetState = resetGameState();

    expect(resetState.pet.name).toBe("Pokemon Partner");
    expect(resetState.pet.level).toBe(1);
    expect(resetState.pet.availableFoodPoints).toBe(0);
    expect(resetState.pet.growthProgress).toBe(0);
    expect(resetState.pet.pokemonSpecies).toBe("bulbasaur");
    expect(resetState.totalCompletedTasks).toBe(0);
    expect(resetState.qualityScore).toBe(0);
    expect(resetState.qualityTarget).toBe(75);
    expect(resetState.tasks.every((task) => !task.isCompleted)).toBe(true);
  });

  it("senkt Motivation nach 24 Stunden ohne Training", () => {
    const initialGameState = createInitialGameState();

    const resetState = resetDailyProgressIfExpired(
      {
        ...initialGameState,
        pet: {
          ...initialGameState.pet,
          happiness: 80,
          lastFedAt: "2026-05-31T08:00:00.000Z",
          happinessGainLastResetAt: "2026-05-31T08:00:00.000Z",
        },
      },
      new Date("2026-06-01T08:00:00.000Z"),
    );

    expect(resetState.pet.happiness).toBe(62);
    expect(resetState.pet.dailyHappinessGained).toBe(0);
  });

  it("leitet Pflegezustaende aus Quest- und Pokemon-Werten ab", () => {
    const initialGameState = createInitialGameState();

    expect(
      derivePetCareState({
        ...initialGameState,
        pet: { ...initialGameState.pet, happiness: 10 },
      }),
    ).toBe("needs-care");

    expect(
      derivePetCareState({
        ...initialGameState,
        pet: {
          ...initialGameState.pet,
          availableFoodPoints: PET_RULES.feedCost,
          happiness: 50,
        },
      }),
    ).toBe("ready-to-feed");

    let qualityGateState = initialGameState;

    for (const task of qualityGateState.tasks) {
      qualityGateState = completeTaskInGameState(qualityGateState, task.id);
    }

    expect(
      derivePetCareState({
        ...qualityGateState,
        pet: {
          ...qualityGateState.pet,
          availableFoodPoints: 0,
          happiness: 92,
          hearts: PET_RULES.maxHearts,
        },
      }),
    ).toBe("thriving");
  });

  it("erlaubt offene Quests und sperrt erledigte Quests", () => {
    const initialGameState = createInitialGameState();
    const firstTaskId = initialGameState.tasks[0].id;
    const completedState = completeTaskInGameState(initialGameState, firstTaskId);

    expect(canCompleteTaskInGameState(initialGameState, firstTaskId)).toBe(true);
    expect(canCompleteTaskInGameState(completedState, firstTaskId)).toBe(false);
  });
});
