import { GameState, MockAccount, StorageSnapshot } from '../models/app-state.model';
import { RegisterCredentials } from '../models/auth.model';
import { PetState } from '../models/pet.model';
import { TaskItem } from '../models/task.model';
import { AppUser } from '../models/user.model';

export const STORAGE_KEY = 'sqs.frontend.mvp.state';

// Die Regeln stehen zentral an einer Stelle, damit man die Demo später
// leicht in ein echtes Balancing oder eine Backend-Konfiguration überführen kann.
export const PET_RULES = {
  feedCost: 10,
  growthPerFeeding: 25,
  happinessPerFeeding: 10,
  maxHappiness: 100,
  maxHearts: 3,
  initialGrowthGoal: 100,
  heartRecoveryStep: 0.5,
  heartRecoveryStreakDays: 2,
  dailyHappinessGainLimit: 50,
  happinessDecayPerMissedDay: 25,
  levelUpCooldownHours: 48,
  maxHunger: 100,
  dailyHungerResetValue: 0,
} as const;

export const HYDRATION_RULES = {
  dailyGoalMl: 3000,
  quickAddMl: [250, 500, 750],
} as const;

export const DEMO_ACCOUNT = {
  email: 'demo@sqs.app',
  password: 'cozyfocus',
  userName: 'Lina',
} as const;

export function createInitialSnapshot(): StorageSnapshot {
  const demoAccount = createMockAccount(DEMO_ACCOUNT);

  return {
    accounts: [demoAccount],
    activeUserId: null,
  };
}

export function createMockAccount(credentials: RegisterCredentials): MockAccount {
  const normalizedEmail = normalizeEmail(credentials.email);
  const now = new Date().toISOString();
  const user = createUser({
    email: normalizedEmail,
    userName: credentials.userName.trim(),
    joinedAt: now,
  });

  return {
    user,
    password: credentials.password,
    gameState: createInitialGameState(),
  };
}

export function createInitialGameState(): GameState {
  const now = new Date().toISOString();

  return {
    pet: createInitialPetState(),
    tasks: createInitialTasks(),
    hydrationMl: 0,
    hydrationGoalMl: HYDRATION_RULES.dailyGoalMl,
    hydrationLastResetAt: now,
    dailyQuestLastResetAt: now,
    totalCompletedTasks: 0,
    totalEarnedPoints: 0,
  };
}

export function calculateNextGrowthGoal(currentGoal: number): number {
  return Math.round(currentGoal * 1.15) + 8;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createUser(input: Pick<AppUser, 'email' | 'userName' | 'joinedAt'>): AppUser {
  return {
    id: createId('user'),
    email: input.email,
    userName: input.userName,
    joinedAt: input.joinedAt,
  };
}

function createInitialPetState(): PetState {
  const now = new Date().toISOString();

  return {
    name: 'Mochi',
    level: 1,
    growthProgress: 0,
    growthGoal: PET_RULES.initialGrowthGoal,
    availableFoodPoints: 0,
    happiness: 0,
    hunger: PET_RULES.dailyHungerResetValue,
    hearts: PET_RULES.maxHearts,
    mealsServed: 0,
    dailyHappinessGained: 0,
    happinessGainLastResetAt: now,
    lastFedAt: null,
    lastHappinessDecayAt: null,
    lastLevelUpAt: null,
    goodCareStreakDays: 0,
    lastGoodCareDay: null,
  };
}

function createInitialTasks(): TaskItem[] {
  return [
    {
      id: createId('task'),
      title: 'Wasser trinken',
      description: 'Eine kurze Pause, die Energie für Kopf und Fokus zurückbringt.',
      icon: 'drop',
      tone: 'peach',
      points: 10,
      isCompleted: false,
    },
    {
      id: createId('task'),
      title: '30 Minuten lernen',
      description: 'Ein klarer Lernblock für stetigen Fortschritt ohne Perfektionsdruck.',
      icon: 'study',
      tone: 'rose',
      points: 20,
      isCompleted: false,
    },
    {
      id: createId('task'),
      title: 'Sport',
      description: 'Bewegung hebt die Stimmung und gibt deinem Pet extra Schwung.',
      icon: 'pulse',
      tone: 'sage',
      points: 20,
      isCompleted: false,
    },
    {
      id: createId('task'),
      title: 'Zimmer aufräumen',
      description: 'Ein ruhiger Raum hilft dabei, den Kopf spürbar freier zu machen.',
      icon: 'spark',
      tone: 'taupe',
      points: 15,
      isCompleted: false,
    },
    {
      id: createId('task'),
      title: '10 Seiten lesen',
      description: 'Ein kleiner Leseschritt für Konzentration und konstante Routine.',
      icon: 'book',
      tone: 'peach',
      points: 10,
      isCompleted: false,
    },
  ];
}

function createId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${randomPart}`;
}
