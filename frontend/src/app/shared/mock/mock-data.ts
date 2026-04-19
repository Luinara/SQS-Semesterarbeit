import { GameState, MockAccount, StorageSnapshot } from '../models/app-state.model';
import { RegisterCredentials } from '../models/auth.model';
import { PetState } from '../models/pet.model';
import { TaskItem } from '../models/task.model';
import { AppUser } from '../models/user.model';

export const STORAGE_KEY = 'sqs.frontend.mvp.state';

// Die Regeln stehen zentral an einer Stelle, damit man die Demo spaeter
// leicht in ein echtes Balancing oder eine Backend-Konfiguration ueberfuehren kann.
export const PET_RULES = {
  feedCost: 12,
  growthPerFeeding: 34,
  maxHappiness: 100,
  maxHearts: 5,
  initialGrowthGoal: 100,
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
  return {
    pet: createInitialPetState(),
    tasks: createInitialTasks(),
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
  return {
    name: 'Mochi',
    level: 1,
    growthProgress: 28,
    growthGoal: PET_RULES.initialGrowthGoal,
    availableFoodPoints: 10,
    happiness: 64,
    hearts: 3,
    mealsServed: 1,
  };
}

function createInitialTasks(): TaskItem[] {
  return [
    {
      id: createId('task'),
      title: 'Wasser trinken',
      description: 'Eine kurze Pause, die Energie fuer Kopf und Fokus zurueckbringt.',
      icon: 'drop',
      tone: 'peach',
      points: 8,
      isCompleted: false,
    },
    {
      id: createId('task'),
      title: '30 Minuten lernen',
      description: 'Ein klarer Lernblock fuer stetigen Fortschritt ohne Perfektionsdruck.',
      icon: 'study',
      tone: 'rose',
      points: 16,
      isCompleted: false,
    },
    {
      id: createId('task'),
      title: 'Sport',
      description: 'Bewegung hebt die Stimmung und gibt deinem Pet extra Schwung.',
      icon: 'pulse',
      tone: 'sage',
      points: 18,
      isCompleted: false,
    },
    {
      id: createId('task'),
      title: 'Zimmer aufraeumen',
      description: 'Ein ruhiger Raum hilft dabei, den Kopf spuerbar freier zu machen.',
      icon: 'spark',
      tone: 'taupe',
      points: 12,
      isCompleted: false,
    },
    {
      id: createId('task'),
      title: '10 Seiten lesen',
      description: 'Ein kleiner Leseschritt fuer Konzentration und konstante Routine.',
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
