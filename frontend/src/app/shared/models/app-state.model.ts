import { PetState } from './pet.model';
import { TaskItem } from './task.model';
import { AppUser } from './user.model';

export interface GameState {
  pet: PetState;
  tasks: TaskItem[];
  hydrationMl: number;
  hydrationGoalMl: number;
  hydrationLastResetAt: string;
  totalCompletedTasks: number;
  totalEarnedPoints: number;
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
