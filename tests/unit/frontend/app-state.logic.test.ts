import {
  completeTaskInGameState,
  createRegisteredAccount,
  feedPetInGameState,
  findAccountForLogin,
  hasAccountWithEmail,
  resetGameState,
} from "../../../frontend/src/app/core/state/app-state.logic";
import {
  createInitialGameState,
  createInitialSnapshot,
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

  it("erkennt vorhandene Konten unabhaengig von Gross- und Kleinschreibung", () => {
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

  it("markiert eine Aufgabe als erledigt und schreibt Punkte dem Pet gut", () => {
    const initialGameState = createInitialGameState();
    const firstTask = initialGameState.tasks[0];

    const updatedGameState = completeTaskInGameState(
      initialGameState,
      firstTask.id,
    );

    expect(updatedGameState.tasks[0].isCompleted).toBe(true);
    expect(updatedGameState.totalCompletedTasks).toBe(1);
    expect(updatedGameState.totalEarnedPoints).toBe(firstTask.points);
    expect(updatedGameState.pet.availableFoodPoints).toBe(
      initialGameState.pet.availableFoodPoints + firstTask.points,
    );
    expect(updatedGameState.pet.happiness).toBe(
      initialGameState.pet.happiness + 4,
    );
  });

  it("laesst eine bereits erledigte Aufgabe beim zweiten Versuch unveraendert", () => {
    const initialGameState = createInitialGameState();
    const firstTaskId = initialGameState.tasks[0].id;

    const onceCompleted = completeTaskInGameState(
      initialGameState,
      firstTaskId,
    );
    const twiceCompleted = completeTaskInGameState(onceCompleted, firstTaskId);

    expect(twiceCompleted).toEqual(onceCompleted);
  });

  it("fuettert das Pet nur, wenn genug Punkte vorhanden sind", () => {
    const initialGameState = createInitialGameState();

    const unchangedGameState = feedPetInGameState(initialGameState);

    expect(unchangedGameState).toEqual(initialGameState);
  });

  it("erhoeht Level und behaelt Ueberschuss-Fortschritt beim Fuettern", () => {
    const initialGameState = createInitialGameState();
    const preparedGameState = {
      ...initialGameState,
      pet: {
        ...initialGameState.pet,
        availableFoodPoints: 24,
        growthProgress: 80,
        growthGoal: 100,
        happiness: 70,
        hearts: 3,
      },
    };

    const updatedGameState = feedPetInGameState(preparedGameState);

    expect(updatedGameState.pet.level).toBe(2);
    expect(updatedGameState.pet.growthProgress).toBe(14);
    expect(updatedGameState.pet.growthGoal).toBe(123);
    expect(updatedGameState.pet.availableFoodPoints).toBe(
      24 - PET_RULES.feedCost,
    );
    expect(updatedGameState.pet.happiness).toBe(84);
    expect(updatedGameState.pet.hearts).toBe(4);
    expect(updatedGameState.pet.mealsServed).toBe(
      preparedGameState.pet.mealsServed + 1,
    );
  });

  it("setzt den Spielzustand auf die Demo-Ausgangswerte zurueck", () => {
    const resetState = resetGameState();

    expect(resetState.pet.name).toBe("Mochi");
    expect(resetState.totalCompletedTasks).toBe(0);
    expect(resetState.tasks.every((task) => !task.isCompleted)).toBe(true);
  });
});
