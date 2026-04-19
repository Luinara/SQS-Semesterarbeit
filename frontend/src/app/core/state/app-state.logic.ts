import { GameState, MockAccount } from '../../shared/models/app-state.model';
import { LoginCredentials, RegisterCredentials } from '../../shared/models/auth.model';
import {
  calculateNextGrowthGoal,
  createInitialGameState,
  createMockAccount,
  normalizeEmail,
  PET_RULES,
} from '../../shared/mock/mock-data';

// Die Service-Klasse soll nur orchestrieren:
// lesen, schreiben, Signals pflegen.
// Die eigentlichen Fachregeln liegen deshalb als pure Funktionen hier,
// damit sie leicht testbar und spaeter auch ausserhalb von Angular nutzbar bleiben.

export function findAccountForLogin(
  accounts: MockAccount[],
  credentials: LoginCredentials
): MockAccount | null {
  const normalizedEmail = normalizeEmail(credentials.email);

  return (
    accounts.find(
      (account) =>
        account.user.email === normalizedEmail && account.password === credentials.password
    ) ?? null
  );
}

export function hasAccountWithEmail(accounts: MockAccount[], email: string): boolean {
  const normalizedEmail = normalizeEmail(email);
  return accounts.some((account) => account.user.email === normalizedEmail);
}

export function createRegisteredAccount(credentials: RegisterCredentials): MockAccount {
  return createMockAccount({
    ...credentials,
    email: normalizeEmail(credentials.email),
    userName: credentials.userName.trim(),
  });
}

export function completeTaskInGameState(gameState: GameState, taskId: string): GameState {
  const taskToComplete = gameState.tasks.find((task) => task.id === taskId && !task.isCompleted);

  if (!taskToComplete) {
    return gameState;
  }

  return {
    ...gameState,
    tasks: gameState.tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted: true } : task
    ),
    totalCompletedTasks: gameState.totalCompletedTasks + 1,
    totalEarnedPoints: gameState.totalEarnedPoints + taskToComplete.points,
    pet: {
      ...gameState.pet,
      availableFoodPoints: gameState.pet.availableFoodPoints + taskToComplete.points,
      happiness: Math.min(PET_RULES.maxHappiness, gameState.pet.happiness + 4),
      hearts: Math.min(PET_RULES.maxHearts, gameState.pet.hearts + 1),
    },
  };
}

export function feedPetInGameState(gameState: GameState): GameState {
  const currentPet = gameState.pet;

  if (currentPet.availableFoodPoints < PET_RULES.feedCost) {
    return gameState;
  }

  let nextLevel = currentPet.level;
  let nextGrowthGoal = currentPet.growthGoal;
  let nextGrowthProgress = currentPet.growthProgress + PET_RULES.growthPerFeeding;
  let nextHappiness = Math.min(PET_RULES.maxHappiness, currentPet.happiness + 8);

  // Ueberschuessiger Fortschritt bleibt erhalten.
  // Dadurch fuehlt sich Fuettern nicht nach "verschwendeten" Punkten an.
  while (nextGrowthProgress >= nextGrowthGoal) {
    nextGrowthProgress -= nextGrowthGoal;
    nextLevel += 1;
    nextGrowthGoal = calculateNextGrowthGoal(nextGrowthGoal);
    nextHappiness = Math.min(PET_RULES.maxHappiness, nextHappiness + 6);
  }

  return {
    ...gameState,
    pet: {
      ...currentPet,
      level: nextLevel,
      growthProgress: nextGrowthProgress,
      growthGoal: nextGrowthGoal,
      availableFoodPoints: currentPet.availableFoodPoints - PET_RULES.feedCost,
      happiness: nextHappiness,
      hearts: Math.min(PET_RULES.maxHearts, currentPet.hearts + 1),
      mealsServed: currentPet.mealsServed + 1,
    },
  };
}

export function resetGameState(): GameState {
  return createInitialGameState();
}
