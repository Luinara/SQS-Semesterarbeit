import { GameFeedback, GameState, MockAccount } from '../../shared/models/app-state.model';
import { LoginCredentials, RegisterCredentials } from '../../shared/models/auth.model';
import { PetCareState, PetState } from '../../shared/models/pet.model';
import {
  calculateNextGrowthGoal,
  createInitialGameState,
  createMockAccount,
  HYDRATION_RULES,
  normalizeEmail,
  PET_RULES,
} from '../../shared/mock/mock-data';

export interface GameStateActionResult {
  gameState: GameState;
  feedback: GameFeedback | null;
}

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

export function completeTaskInGameStateWithFeedback(
  gameState: GameState,
  taskId: string
): GameStateActionResult {
  const normalizedGameState = normalizeGameState(gameState);
  const taskToComplete = normalizedGameState.tasks.find(
    (task) => task.id === taskId && !task.isCompleted
  );

  if (!taskToComplete) {
    return {
      gameState: normalizedGameState,
      feedback: null,
    };
  }

  if (isHydrationQuest(taskToComplete) && !isHydrationGoalReached(normalizedGameState)) {
    return {
      gameState: normalizedGameState,
      feedback: createGameFeedback(
        'info',
        'Diese Tagesquest wird erst abgeschlossen, wenn die Wasseranzeige voll ist.'
      ),
    };
  }

  return completeTask(normalizedGameState, taskToComplete);
}

export function completeTaskInGameState(gameState: GameState, taskId: string): GameState {
  return completeTaskInGameStateWithFeedback(gameState, taskId).gameState;
}

export function feedPetInGameStateWithFeedback(
  gameState: GameState,
  now = new Date()
): GameStateActionResult {
  const normalizedGameState = resetDailyProgressIfExpired(gameState, now);
  const currentPet = normalizedGameState.pet;

  if (currentPet.availableFoodPoints < PET_RULES.feedCost) {
    return {
      gameState: normalizedGameState,
      feedback: createGameFeedback(
        'info',
        `Noch ${PET_RULES.feedCost - currentPet.availableFoodPoints} Punkte bis zur nächsten Fütterung.`
      ),
    };
  }

  const remainingDailyHappiness = Math.max(
    0,
    PET_RULES.dailyHappinessGainLimit - currentPet.dailyHappinessGained
  );
  const happinessGain = Math.min(
    PET_RULES.happinessPerFeeding,
    remainingDailyHappiness,
    PET_RULES.maxHappiness - currentPet.happiness
  );
  const growthResult = calculateFeedingGrowth(currentPet, now);

  const updatedGameState: GameState = {
    ...normalizedGameState,
    pet: {
      ...currentPet,
      level: growthResult.level,
      growthProgress: growthResult.growthProgress,
      growthGoal: growthResult.growthGoal,
      availableFoodPoints: currentPet.availableFoodPoints - PET_RULES.feedCost,
      happiness: currentPet.happiness + happinessGain,
      hunger: PET_RULES.dailyHungerResetValue,
      hearts: currentPet.hearts,
      mealsServed: currentPet.mealsServed + 1,
      dailyHappinessGained: currentPet.dailyHappinessGained + happinessGain,
      happinessGainLastResetAt: currentPet.happinessGainLastResetAt,
      lastFedAt: now.toISOString(),
      lastHappinessDecayAt: currentPet.lastHappinessDecayAt,
      lastLevelUpAt: growthResult.didLevelUp ? now.toISOString() : currentPet.lastLevelUpAt,
    },
  };

  if (growthResult.didLevelUp) {
    return {
      gameState: updatedGameState,
      feedback: createGameFeedback(
        'level-up',
        `${currentPet.name} ist jetzt Level ${growthResult.level}.`
      ),
    };
  }

  if (happinessGain <= 0) {
    return {
      gameState: updatedGameState,
      feedback: createGameFeedback(
        'feeding',
        'Gefüttert. Das tägliche Happiness-Limit ist für heute erreicht.'
      ),
    };
  }

  return {
    gameState: updatedGameState,
    feedback: createGameFeedback(
      'feeding',
      `${currentPet.name} wurde gefüttert: +${happinessGain} Happiness.`
    ),
  };
}

export function feedPetInGameState(gameState: GameState): GameState {
  return feedPetInGameStateWithFeedback(gameState).gameState;
}

export function addHydrationInGameStateWithFeedback(
  gameState: GameState,
  amountMl: number
): GameStateActionResult {
  const normalizedGameState = normalizeGameState(gameState);

  if (amountMl <= 0) {
    return {
      gameState: normalizedGameState,
      feedback: null,
    };
  }

  const hydrationGoalMl = normalizedGameState.hydrationGoalMl || HYDRATION_RULES.dailyGoalMl;
  const nextHydrationMl = Math.min(
    hydrationGoalMl,
    (normalizedGameState.hydrationMl ?? 0) + amountMl
  );
  const updatedGameState: GameState = {
    ...normalizedGameState,
    hydrationGoalMl,
    hydrationMl: nextHydrationMl,
  };
  const hydrationQuest = updatedGameState.tasks.find(
    (task) => isHydrationQuest(task) && !task.isCompleted
  );

  if (nextHydrationMl >= hydrationGoalMl && hydrationQuest) {
    const result = completeTask(updatedGameState, hydrationQuest);

    return {
      gameState: result.gameState,
      feedback: createGameFeedback(
        'hydration',
        `Tagesziel erreicht: "${hydrationQuest.title}" wurde automatisch abgeschlossen.`
      ),
    };
  }

  return {
    gameState: updatedGameState,
    feedback: createGameFeedback(
      'hydration',
      nextHydrationMl >= hydrationGoalMl
        ? 'Tagesziel erreicht. Dein Pet spürt den Wasser-Flow.'
        : `+${amountMl} ml Wasser eingetragen.`
    ),
  };
}

export function addHydrationInGameState(gameState: GameState, amountMl: number): GameState {
  return addHydrationInGameStateWithFeedback(gameState, amountMl).gameState;
}

export function resetDailyProgressIfExpired(gameState: GameState, now = new Date()): GameState {
  const normalizedGameState = normalizeGameState(gameState, now);
  const dailyQuestLastResetAt = normalizedGameState.dailyQuestLastResetAt;
  const hydrationLastResetAt = normalizedGameState.hydrationLastResetAt;
  const shouldResetQuests = isBeforeToday(dailyQuestLastResetAt, now);
  const shouldResetHydration = isBeforeToday(hydrationLastResetAt, now);
  const shouldResetHappinessLimit = isBeforeToday(
    normalizedGameState.pet.happinessGainLastResetAt,
    now
  );

  let nextPet = applyHappinessDecay(normalizedGameState.pet, now);

  if (shouldResetQuests || shouldResetHydration || shouldResetHappinessLimit) {
    nextPet = applyGoodCareStreak(nextPet, normalizedGameState);
  }

  if (!shouldResetQuests && !shouldResetHydration && !shouldResetHappinessLimit) {
    return {
      ...normalizedGameState,
      pet: nextPet,
    };
  }

  const nowIso = now.toISOString();

  return {
    ...normalizedGameState,
    tasks: shouldResetQuests
      ? normalizedGameState.tasks.map((task) => ({ ...task, isCompleted: false }))
      : normalizedGameState.tasks,
    hydrationMl: shouldResetHydration ? 0 : normalizedGameState.hydrationMl,
    hydrationGoalMl: normalizedGameState.hydrationGoalMl || HYDRATION_RULES.dailyGoalMl,
    hydrationLastResetAt: shouldResetHydration ? nowIso : hydrationLastResetAt,
    dailyQuestLastResetAt: shouldResetQuests ? nowIso : dailyQuestLastResetAt,
    pet: {
      ...nextPet,
      availableFoodPoints: shouldResetQuests ? 0 : nextPet.availableFoodPoints,
      hunger: shouldResetQuests ? PET_RULES.dailyHungerResetValue : nextPet.hunger,
      dailyHappinessGained: shouldResetHappinessLimit ? 0 : nextPet.dailyHappinessGained,
      happinessGainLastResetAt: shouldResetHappinessLimit
        ? nowIso
        : nextPet.happinessGainLastResetAt,
    },
  };
}

export function resetGameState(): GameState {
  return createInitialGameState();
}

export function derivePetCareState(gameState: GameState): PetCareState {
  const normalizedGameState = normalizeGameState(gameState);
  const pet = normalizedGameState.pet;
  const growthRatio = pet.growthGoal <= 0 ? 0 : pet.growthProgress / pet.growthGoal;

  if (pet.happiness < 25 || pet.hearts <= 1) {
    return 'needs-care';
  }

  if (pet.availableFoodPoints >= PET_RULES.feedCost) {
    return 'ready-to-feed';
  }

  if (growthRatio >= 0.7) {
    return 'growing';
  }

  if (pet.happiness >= 75 && pet.hearts >= PET_RULES.maxHearts) {
    return 'thriving';
  }

  return 'calm';
}

export function canCompleteTaskInGameState(gameState: GameState, taskId: string): boolean {
  const normalizedGameState = normalizeGameState(gameState);
  const task = normalizedGameState.tasks.find((candidate) => candidate.id === taskId);

  if (!task || task.isCompleted) {
    return false;
  }

  return !isHydrationQuest(task) || isHydrationGoalReached(normalizedGameState);
}

export function normalizeGameState(gameState: GameState, now = new Date()): GameState {
  const nowIso = now.toISOString();
  const hydrationLastResetAt = gameState.hydrationLastResetAt ?? nowIso;
  const dailyQuestLastResetAt =
    gameState.dailyQuestLastResetAt ?? gameState.hydrationLastResetAt ?? nowIso;

  return {
    ...gameState,
    hydrationMl: gameState.hydrationMl ?? 0,
    hydrationGoalMl: gameState.hydrationGoalMl || HYDRATION_RULES.dailyGoalMl,
    hydrationLastResetAt,
    dailyQuestLastResetAt,
    pet: normalizePetState(gameState.pet, nowIso),
  };
}

function completeTask(
  gameState: GameState,
  taskToComplete: GameState['tasks'][number]
): GameStateActionResult {
  const updatedGameState: GameState = {
    ...gameState,
    tasks: gameState.tasks.map((task) =>
      task.id === taskToComplete.id ? { ...task, isCompleted: true } : task
    ),
    totalCompletedTasks: gameState.totalCompletedTasks + 1,
    totalEarnedPoints: gameState.totalEarnedPoints + taskToComplete.points,
    pet: {
      ...gameState.pet,
      availableFoodPoints: gameState.pet.availableFoodPoints + taskToComplete.points,
    },
  };

  return {
    gameState: updatedGameState,
    feedback: createGameFeedback(
      'quest',
      `Tagesquest abgeschlossen: +${taskToComplete.points} Futterpunkte.`
    ),
  };
}

function normalizePetState(pet: PetState, nowIso: string): PetState {
  return {
    ...pet,
    growthProgress: pet.growthProgress ?? 0,
    growthGoal: pet.growthGoal || PET_RULES.initialGrowthGoal,
    availableFoodPoints: pet.availableFoodPoints ?? 0,
    happiness: clamp(pet.happiness ?? 0, 0, PET_RULES.maxHappiness),
    hunger: clamp(pet.hunger ?? PET_RULES.dailyHungerResetValue, 0, PET_RULES.maxHunger),
    hearts: clamp(pet.hearts ?? PET_RULES.maxHearts, 0, PET_RULES.maxHearts),
    mealsServed: pet.mealsServed ?? 0,
    dailyHappinessGained: clamp(
      pet.dailyHappinessGained ?? 0,
      0,
      PET_RULES.dailyHappinessGainLimit
    ),
    happinessGainLastResetAt: pet.happinessGainLastResetAt ?? nowIso,
    lastFedAt: pet.lastFedAt ?? null,
    lastHappinessDecayAt: pet.lastHappinessDecayAt ?? null,
    lastLevelUpAt: pet.lastLevelUpAt ?? null,
    goodCareStreakDays: Math.max(0, pet.goodCareStreakDays ?? 0),
    lastGoodCareDay: pet.lastGoodCareDay ?? null,
  };
}

function calculateFeedingGrowth(
  pet: PetState,
  now: Date
): Pick<PetState, 'level' | 'growthProgress' | 'growthGoal'> & { didLevelUp: boolean } {
  const progressAfterFeeding = Math.min(
    pet.growthGoal,
    pet.growthProgress + PET_RULES.growthPerFeeding
  );

  if (progressAfterFeeding < pet.growthGoal || !canLevelUp(pet, now)) {
    return {
      level: pet.level,
      growthProgress: progressAfterFeeding,
      growthGoal: pet.growthGoal,
      didLevelUp: false,
    };
  }

  return {
    level: pet.level + 1,
    growthProgress: 0,
    growthGoal: calculateNextGrowthGoal(pet.growthGoal),
    didLevelUp: true,
  };
}

function canLevelUp(pet: PetState, now: Date): boolean {
  if (!pet.lastLevelUpAt) {
    return true;
  }

  const lastLevelUpAt = new Date(pet.lastLevelUpAt);

  if (Number.isNaN(lastLevelUpAt.getTime())) {
    return true;
  }

  return hoursBetween(lastLevelUpAt, now) >= PET_RULES.levelUpCooldownHours;
}

function applyHappinessDecay(pet: PetState, now: Date): PetState {
  if (!pet.lastFedAt) {
    return pet;
  }

  const lastFedAt = new Date(pet.lastFedAt);
  const lastDecayAt = pet.lastHappinessDecayAt ? new Date(pet.lastHappinessDecayAt) : null;

  if (Number.isNaN(lastFedAt.getTime())) {
    return {
      ...pet,
      lastFedAt: null,
    };
  }

  const decayAnchor =
    lastDecayAt && !Number.isNaN(lastDecayAt.getTime()) && lastDecayAt > lastFedAt
      ? lastDecayAt
      : lastFedAt;
  const fullDaysWithoutFeeding = Math.floor(hoursBetween(decayAnchor, now) / 24);

  if (fullDaysWithoutFeeding <= 0) {
    return pet;
  }

  const decayAppliedAt = new Date(
    decayAnchor.getTime() + fullDaysWithoutFeeding * 24 * 60 * 60 * 1000
  );

  return {
    ...pet,
    happiness: Math.max(
      0,
      pet.happiness - fullDaysWithoutFeeding * PET_RULES.happinessDecayPerMissedDay
    ),
    lastHappinessDecayAt: decayAppliedAt.toISOString(),
  };
}

function applyGoodCareStreak(pet: PetState, gameState: GameState): PetState {
  const caredDay = new Date(gameState.dailyQuestLastResetAt);

  if (Number.isNaN(caredDay.getTime())) {
    return pet;
  }

  const didCareOnDay =
    gameState.hydrationMl >= (gameState.hydrationGoalMl || HYDRATION_RULES.dailyGoalMl) ||
    isSameCalendarDay(pet.lastFedAt, caredDay);

  if (!didCareOnDay) {
    return {
      ...pet,
      goodCareStreakDays: 0,
      lastGoodCareDay: null,
    };
  }

  if (isSameCalendarDay(pet.lastGoodCareDay, caredDay)) {
    return pet;
  }

  const wasPreviousCareDay = pet.lastGoodCareDay
    ? isPreviousCalendarDay(new Date(pet.lastGoodCareDay), caredDay)
    : false;
  const nextStreakDays = wasPreviousCareDay ? pet.goodCareStreakDays + 1 : 1;
  const shouldRecoverHeart =
    nextStreakDays > 0 && nextStreakDays % PET_RULES.heartRecoveryStreakDays === 0;

  return {
    ...pet,
    hearts: shouldRecoverHeart
      ? Math.min(PET_RULES.maxHearts, pet.hearts + PET_RULES.heartRecoveryStep)
      : pet.hearts,
    goodCareStreakDays: nextStreakDays,
    lastGoodCareDay: formatDay(caredDay),
  };
}

function isHydrationQuest(task: GameState['tasks'][number]): boolean {
  return task.icon === 'drop';
}

function isHydrationGoalReached(gameState: GameState): boolean {
  const hydrationGoalMl = gameState.hydrationGoalMl || HYDRATION_RULES.dailyGoalMl;

  return (gameState.hydrationMl ?? 0) >= hydrationGoalMl;
}

function isBeforeToday(isoDate: string, now: Date): boolean {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return true;
  }

  return dayStart(date).getTime() < dayStart(now).getTime();
}

function isSameCalendarDay(isoDate: string | null, date: Date): boolean {
  if (!isoDate) {
    return false;
  }

  const otherDate = new Date(isoDate);

  if (Number.isNaN(otherDate.getTime())) {
    return false;
  }

  return dayStart(otherDate).getTime() === dayStart(date).getTime();
}

function isPreviousCalendarDay(previousDate: Date, currentDate: Date): boolean {
  return dayStart(currentDate).getTime() - dayStart(previousDate).getTime() === 24 * 60 * 60 * 1000;
}

function dayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDay(date: Date): string {
  return dayStart(date).toISOString();
}

function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (60 * 60 * 1000);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createGameFeedback(kind: GameFeedback['kind'], message: string): GameFeedback {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    message,
  };
}
