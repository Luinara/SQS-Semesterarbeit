import { PetState } from './pet.model';
import { TaskItem } from './task.model';
import { AppUser } from './user.model';

export interface GameState {
  pet: PetState;
  tasks: TaskItem[];
  hydrationMl: number;
  hydrationGoalMl: number;
  hydrationLastResetAt: string;
  dailyQuestLastResetAt: string;
  totalCompletedTasks: number;
  totalEarnedPoints: number;
}

export type GameFeedbackKind = 'quest' | 'hydration' | 'feeding' | 'level-up' | 'info';

export interface GameFeedback {
  id: string;
  kind: GameFeedbackKind;
  message: string;
}

export interface MockAccount {
  user: AppUser;
  password: string;
  gameState: GameState;
}

export interface StorageSnapshot {
  accounts: MockAccount[];
  activeUserId: string | null;
}
