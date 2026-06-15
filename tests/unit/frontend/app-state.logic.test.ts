import {
  addHydrationInGameState,
  canCompleteTaskInGameState,
  completeTaskInGameState,
  completeTaskInGameStateWithFeedback,
  createRegisteredAccount,
  derivePetCareState,
  feedPetInGameState,
  feedPetInGameStateWithFeedback,
  findAccountForLogin,
  hasAccountWithEmail,
  resetDailyProgressIfExpired,
  resetGameState,
} from "../../../frontend/src/app/core/state/app-state.logic";
import {
  createInitialGameState,
  createInitialSnapshot,
  HYDRATION_RULES,
  PET_RULES,
} from "../../../frontend/src/app/shared/mock/mock-data";

describe("app-state.logic", () => {
  it("meldet den Demo-Account auch mit gemischter Schreibweise der E-Mail an", () => {
    const snapshot = createInitialSnapshot();

    const account = findAccountForLogin(snapshot.accounts, {
      email: "  DEMO@SQS.APP ",
      password: "cozyfocus",
    });

    expect(account?.user.userName).toBe("Lina");
  });

  it("erkennt vorhandene Konten unabhängig von Groß- und Kleinschreibung", () => {
    const snapshot = createInitialSnapshot();

    expect(hasAccountWithEmail(snapshot.accounts, " Demo@Sqs.App ")).toBe(true);
    expect(hasAccountWithEmail(snapshot.accounts, "neu@sqs.app")).toBe(false);
  });

  it("erstellt neue Konten mit bereinigten Eingaben und frischem Startzustand", () => {
    const account = createRegisteredAccount({
      email: "  TEST@SQS.APP ",
      password: "geheim123",
      userName: "  Mira  ",
    });

    expect(account.user.email).toBe("test@sqs.app");
    expect(account.user.userName).toBe("Mira");
    expect(account.gameState.tasks).toHaveLength(5);
    expect(account.gameState.pet.level).toBe(1);
  });

  it("markiert eine Aufgabe als erledigt und schreibt nur Futterpunkte gut", () => {
    const initialGameState = createInitialGameState();
    const firstTask = initialGameState.tasks[1];

    const updatedGameState = completeTaskInGameState(
      initialGameState,
      firstTask.id,
    );

    expect(updatedGameState.tasks[1].isCompleted).toBe(true);
    expect(updatedGameState.totalCompletedTasks).toBe(1);
    expect(updatedGameState.totalEarnedPoints).toBe(firstTask.points);
    expect(updatedGameState.pet.availableFoodPoints).toBe(firstTask.points);
    expect(updatedGameState.pet.happiness).toBe(initialGameState.pet.happiness);
  });

  it("liefert beim Abschließen einer Tagesquest ein klares Spiel-Feedback", () => {
    const initialGameState = createInitialGameState();
    const firstTask = initialGameState.tasks[1];

    const result = completeTaskInGameStateWithFeedback(
      initialGameState,
      firstTask.id,
    );

    expect(result.gameState.tasks[1].isCompleted).toBe(true);
    expect(result.feedback?.kind).toBe("quest");
    expect(result.feedback?.message).toContain(`+${firstTask.points}`);
  });

  it("lässt eine bereits erledigte Aufgabe beim zweiten Versuch unverändert", () => {
    const initialGameState = createInitialGameState();
    const firstTaskId = initialGameState.tasks[1].id;

    const onceCompleted = completeTaskInGameState(
      initialGameState,
      firstTaskId,
    );
    const twiceCompleted = completeTaskInGameState(onceCompleted, firstTaskId);

    expect(twiceCompleted).toEqual(onceCompleted);
  });

  it("füttert das Pet nur, wenn genug Punkte vorhanden sind", () => {
    const initialGameState = createInitialGameState();

    const unchangedGameState = feedPetInGameState(initialGameState);

    expect(unchangedGameState).toEqual(initialGameState);
  });

  it("erhöht Happiness beim Füttern, aber nur bis zum Tageslimit", () => {
    const initialGameState = createInitialGameState();
    let gameState = {
      ...initialGameState,
      pet: {
        ...initialGameState.pet,
        availableFoodPoints: 100,
      },
    };

    for (let index = 0; index < 5; index += 1) {
      gameState = feedPetInGameState(gameState);
    }

    expect(gameState.pet.happiness).toBe(PET_RULES.dailyHappinessGainLimit);
    expect(gameState.pet.dailyHappinessGained).toBe(
      PET_RULES.dailyHappinessGainLimit,
    );
  });

  it("setzt das tägliche Happiness-Limit am neuen Tag zurück", () => {
    const initialGameState = createInitialGameState();
    const resetState = resetDailyProgressIfExpired(
      {
        ...initialGameState,
        dailyQuestLastResetAt: "2026-05-31T08:00:00.000Z",
        hydrationLastResetAt: "2026-05-31T08:00:00.000Z",
        pet: {
          ...initialGameState.pet,
          dailyHappinessGained: PET_RULES.dailyHappinessGainLimit,
          happinessGainLastResetAt: "2026-05-31T08:00:00.000Z",
        },
      },
      new Date("2026-06-01T08:00:00.000Z"),
    );

    expect(resetState.pet.dailyHappinessGained).toBe(0);
  });

  it("erhöht Level beim ersten erlaubten Wachstum", () => {
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
    expect(updatedGameState.pet.growthProgress).toBe(0);
    expect(updatedGameState.pet.growthGoal).toBe(123);
    expect(updatedGameState.pet.availableFoodPoints).toBe(
      24 - PET_RULES.feedCost,
    );
    expect(updatedGameState.pet.happiness).toBe(80);
    expect(updatedGameState.pet.hearts).toBe(PET_RULES.maxHearts);
  });

  it("deckt Wachstum am Ziel, wenn der Level-Up-Cooldown aktiv ist", () => {
    const initialGameState = createInitialGameState();
    const preparedGameState = {
      ...initialGameState,
      pet: {
        ...initialGameState.pet,
        availableFoodPoints: 24,
        growthProgress: 80,
        growthGoal: 100,
        lastLevelUpAt: "2026-05-31T08:00:00.000Z",
      },
    };

    const result = feedPetInGameStateWithFeedback(
      preparedGameState,
      new Date("2026-06-01T08:00:00.000Z"),
    );

    expect(result.gameState.pet.level).toBe(1);
    expect(result.gameState.pet.growthProgress).toBe(100);
    expect(result.feedback?.kind).toBe("feeding");
  });

  it("erlaubt den nächsten Level-Up nach 48 Stunden", () => {
    const initialGameState = createInitialGameState();
    const preparedGameState = {
      ...initialGameState,
      dailyQuestLastResetAt: "2026-06-02T08:00:00.000Z",
      hydrationLastResetAt: "2026-06-02T08:00:00.000Z",
      pet: {
        ...initialGameState.pet,
        availableFoodPoints: 24,
        growthProgress: 100,
        growthGoal: 100,
        happinessGainLastResetAt: "2026-06-02T08:00:00.000Z",
        lastLevelUpAt: "2026-05-31T08:00:00.000Z",
      },
    };

    const result = feedPetInGameStateWithFeedback(
      preparedGameState,
      new Date("2026-06-02T08:00:00.000Z"),
    );

    expect(result.gameState.pet.level).toBe(2);
    expect(result.feedback?.kind).toBe("level-up");
  });

  it("setzt den Spielzustand auf leere Demo-Werte zurück", () => {
    const resetState = resetGameState();

    expect(resetState.pet.name).toBe("Mochi");
    expect(resetState.pet.level).toBe(1);
    expect(resetState.pet.availableFoodPoints).toBe(0);
    expect(resetState.pet.happiness).toBe(0);
    expect(resetState.pet.growthProgress).toBe(0);
    expect(resetState.pet.hunger).toBe(0);
    expect(resetState.pet.hearts).toBe(3);
    expect(resetState.pet.mealsServed).toBe(0);
    expect(resetState.totalCompletedTasks).toBe(0);
    expect(resetState.hydrationMl).toBe(0);
    expect(resetState.hydrationGoalMl).toBe(3000);
    expect(resetState.dailyQuestLastResetAt).toBeTruthy();
    expect(resetState.tasks.every((task) => !task.isCompleted)).toBe(true);
  });

  it("erhöht Wasserfortschritt bis maximal zum Tagesziel", () => {
    const initialGameState = createInitialGameState();

    const hydratedGameState = addHydrationInGameState(initialGameState, 500);
    const cappedGameState = addHydrationInGameState(hydratedGameState, 9999);

    expect(hydratedGameState.hydrationMl).toBe(500);
    expect(cappedGameState.hydrationMl).toBe(initialGameState.hydrationGoalMl);
  });

  it("sperrt die Wasser-Quest, solange die Wasseranzeige nicht voll ist", () => {
    const initialGameState = createInitialGameState();
    const hydrationTask = initialGameState.tasks[0];

    const result = completeTaskInGameStateWithFeedback(
      initialGameState,
      hydrationTask.id,
    );

    expect(canCompleteTaskInGameState(initialGameState, hydrationTask.id)).toBe(
      false,
    );
    expect(result.gameState).toEqual(initialGameState);
    expect(result.feedback?.kind).toBe("info");
  });

  it("hakt die Wasser-Quest automatisch ab, sobald das Tagesziel erreicht ist", () => {
    const initialGameState = createInitialGameState();
    const hydrationTask = initialGameState.tasks[0];

    const hydratedGameState = addHydrationInGameState(
      initialGameState,
      initialGameState.hydrationGoalMl,
    );

    expect(hydratedGameState.hydrationMl).toBe(
      initialGameState.hydrationGoalMl,
    );
    expect(hydratedGameState.tasks[0].isCompleted).toBe(true);
    expect(hydratedGameState.totalEarnedPoints).toBe(hydrationTask.points);
    expect(hydratedGameState.pet.availableFoodPoints).toBe(
      hydrationTask.points,
    );
  });

  it("setzt Tagesquests, Wasser, Hunger und Futterpunkte am neuen Tag zurück", () => {
    const initialGameState = createInitialGameState();
    const completedState = completeTaskInGameState(
      {
        ...initialGameState,
        hydrationMl: 750,
        hydrationLastResetAt: "2026-05-31T08:00:00.000Z",
        dailyQuestLastResetAt: "2026-05-31T08:00:00.000Z",
        pet: {
          ...initialGameState.pet,
          hunger: 80,
          happinessGainLastResetAt: "2026-05-31T08:00:00.000Z",
        },
      },
      initialGameState.tasks[1].id,
    );

    const resetState = resetDailyProgressIfExpired(
      completedState,
      new Date("2026-06-01T08:00:00.000Z"),
    );

    expect(resetState.tasks.every((task) => !task.isCompleted)).toBe(true);
    expect(resetState.hydrationMl).toBe(0);
    expect(resetState.pet.availableFoodPoints).toBe(0);
    expect(resetState.pet.hunger).toBe(0);
    expect(resetState.pet.level).toBe(completedState.pet.level);
  });

  it("senkt Happiness nach 24 Stunden ohne Fütterung um 25", () => {
    const initialGameState = createInitialGameState();

    const resetState = resetDailyProgressIfExpired(
      {
        ...initialGameState,
        dailyQuestLastResetAt: "2026-05-31T08:00:00.000Z",
        hydrationLastResetAt: "2026-05-31T08:00:00.000Z",
        pet: {
          ...initialGameState.pet,
          happiness: 80,
          lastFedAt: "2026-05-31T08:00:00.000Z",
          happinessGainLastResetAt: "2026-05-31T08:00:00.000Z",
        },
      },
      new Date("2026-06-01T08:00:00.000Z"),
    );

    expect(resetState.pet.happiness).toBe(55);
  });

  it("senkt Happiness nach mehreren verpassten Tagen mehrfach, aber nicht unter 0", () => {
    const initialGameState = createInitialGameState();

    const resetState = resetDailyProgressIfExpired(
      {
        ...initialGameState,
        dailyQuestLastResetAt: "2026-05-29T08:00:00.000Z",
        hydrationLastResetAt: "2026-05-29T08:00:00.000Z",
        pet: {
          ...initialGameState.pet,
          happiness: 60,
          lastFedAt: "2026-05-29T08:00:00.000Z",
          happinessGainLastResetAt: "2026-05-29T08:00:00.000Z",
        },
      },
      new Date("2026-06-01T08:00:00.000Z"),
    );

    expect(resetState.pet.happiness).toBe(0);
  });

  it("baut nach zwei guten Pflegetagen ein halbes Herz auf", () => {
    const initialGameState = createInitialGameState();
    const dayOneReset = resetDailyProgressIfExpired(
      {
        ...initialGameState,
        hydrationMl: HYDRATION_RULES.dailyGoalMl,
        dailyQuestLastResetAt: "2026-05-31T08:00:00.000Z",
        hydrationLastResetAt: "2026-05-31T08:00:00.000Z",
        pet: {
          ...initialGameState.pet,
          hearts: 2,
          happinessGainLastResetAt: "2026-05-31T08:00:00.000Z",
        },
      },
      new Date("2026-06-01T08:00:00.000Z"),
    );
    const dayTwoReset = resetDailyProgressIfExpired(
      {
        ...dayOneReset,
        hydrationMl: HYDRATION_RULES.dailyGoalMl,
        dailyQuestLastResetAt: "2026-06-01T08:00:00.000Z",
        hydrationLastResetAt: "2026-06-01T08:00:00.000Z",
        pet: {
          ...dayOneReset.pet,
          happinessGainLastResetAt: "2026-06-01T08:00:00.000Z",
        },
      },
      new Date("2026-06-02T08:00:00.000Z"),
    );

    expect(dayOneReset.pet.goodCareStreakDays).toBe(1);
    expect(dayOneReset.pet.hearts).toBe(2);
    expect(dayTwoReset.pet.goodCareStreakDays).toBe(2);
    expect(dayTwoReset.pet.hearts).toBe(2.5);
  });

  it("setzt die Pflege-Serie bei verpasster Pflege zurück", () => {
    const initialGameState = createInitialGameState();

    const resetState = resetDailyProgressIfExpired(
      {
        ...initialGameState,
        dailyQuestLastResetAt: "2026-06-01T08:00:00.000Z",
        hydrationLastResetAt: "2026-06-01T08:00:00.000Z",
        pet: {
          ...initialGameState.pet,
          hearts: 2,
          goodCareStreakDays: 1,
          lastGoodCareDay: "2026-05-31T00:00:00.000Z",
          happinessGainLastResetAt: "2026-06-01T08:00:00.000Z",
        },
      },
      new Date("2026-06-02T08:00:00.000Z"),
    );

    expect(resetState.pet.goodCareStreakDays).toBe(0);
    expect(resetState.pet.lastGoodCareDay).toBeNull();
    expect(resetState.pet.hearts).toBe(2);
  });

  it("leitet Pflegezustände aus Pet-Werten ab", () => {
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

    expect(
      derivePetCareState({
        ...initialGameState,
        pet: {
          ...initialGameState.pet,
          availableFoodPoints: 0,
          happiness: 92,
          hearts: PET_RULES.maxHearts,
        },
      }),
    ).toBe("thriving");
  });
});
