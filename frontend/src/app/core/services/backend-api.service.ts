import { Injectable } from '@angular/core';
import { GameState } from '../../shared/models/app-state.model';
import { TaskItem } from '../../shared/models/task.model';
import { AppUser } from '../../shared/models/user.model';
import { PET_RULES, QUALITY_RULES, resolvePokemonSpeciesForLevel } from '../../shared/mock/mock-data';

export interface BackendTaskDto {
  id: number;
  title: string;
  description?: string;
}

export interface BackendTaskCompletionDto {
  id: number;
  title: string;
  completed: boolean;
}

export interface BackendGameStateDto {
  waterLevel: number;
  foodLevel: number;
  pokemonImageUrl: string | null;
  pokemonLevel: number;
  growth: number;
  happiness: number;
  pendingFeedPoints?: number;
  tasks?: BackendTaskCompletionDto[];
  streak: number;
  yesterdayLoggedIn: boolean;
  serverNow: string;
}

export interface DashboardSnapshot {
  user: AppUser;
  gameState: GameState;
  backendGameState: BackendGameStateDto;
}

@Injectable({
  providedIn: 'root',
})
export class BackendApiService {
  async login(username: string, password: string): Promise<DashboardSnapshot> {
    await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    return this.loadDashboard(username);
  }

  async signup(username: string, password: string): Promise<DashboardSnapshot> {
    await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    return this.loadDashboard(username);
  }

  async logout(): Promise<void> {
    await this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async loadDashboard(username: string): Promise<DashboardSnapshot> {
    const [tasks, gameState] = await Promise.all([
      this.getJson<BackendTaskDto[]>('/api/tasks'),
      this.getJson<BackendGameStateDto>('/api/user/game-state'),
    ]);

    return this.createDashboardSnapshot(username, tasks, gameState);
  }

  async completeTask(username: string, taskId: string): Promise<DashboardSnapshot> {
    await this.request(`/api/tasks/${Number(taskId)}/complete`, {
      method: 'POST',
    });

    return this.loadDashboard(username);
  }

  async addWater(username: string, ml: number): Promise<DashboardSnapshot> {
    const gameState = await this.getJson<BackendGameStateDto>('/api/user/water', {
      method: 'POST',
      body: JSON.stringify({ ml }),
    });
    const tasks = await this.getJson<BackendTaskDto[]>('/api/tasks');

    return this.createDashboardSnapshot(username, tasks, gameState);
  }

  async feed(username: string): Promise<DashboardSnapshot> {
    const gameState = await this.getJson<BackendGameStateDto>('/api/user/feed', {
      method: 'POST',
    });
    const tasks = await this.getJson<BackendTaskDto[]>('/api/tasks');

    return this.createDashboardSnapshot(username, tasks, gameState);
  }

  private createDashboardSnapshot(
    username: string,
    tasks: BackendTaskDto[],
    backendGameState: BackendGameStateDto
  ): DashboardSnapshot {
    const displayTasks = mapBackendTasks(tasks, backendGameState.tasks ?? []);
    const totalEarnedPoints = displayTasks
      .filter((task) => task.isCompleted)
      .reduce((total, task) => total + task.points, 0);
    const pokemonLevel = Math.max(1, backendGameState.pokemonLevel || 1);

    return {
      user: {
        id: username,
        email: username,
        userName: username,
        joinedAt: backendGameState.serverNow || new Date().toISOString(),
      },
      backendGameState,
      gameState: {
        pet: {
          name: 'Pokemon Partner',
          level: pokemonLevel,
          growthProgress: clamp(backendGameState.growth ?? 0, 0, PET_RULES.initialGrowthGoal),
          growthGoal: PET_RULES.initialGrowthGoal,
          availableFoodPoints: backendGameState.pendingFeedPoints ?? 0,
          happiness: clamp(backendGameState.happiness ?? 0, 0, PET_RULES.maxHappiness),
          hunger: clamp(backendGameState.foodLevel ?? 0, 0, PET_RULES.maxHunger),
          hearts: PET_RULES.maxHearts,
          mealsServed: 0,
          dailyHappinessGained: 0,
          happinessGainLastResetAt: backendGameState.serverNow || new Date().toISOString(),
          lastFedAt: null,
          lastHappinessDecayAt: null,
          lastLevelUpAt: null,
          goodCareStreakDays: backendGameState.streak ?? 0,
          lastGoodCareDay: null,
          pokemonSpecies: resolvePokemonSpeciesForLevel(pokemonLevel),
        },
        tasks: displayTasks,
        qualityScore: totalEarnedPoints,
        qualityTarget:
          displayTasks.reduce((total, task) => total + task.points, 0) || QUALITY_RULES.targetScore,
        qualityLastResetAt: backendGameState.serverNow || new Date().toISOString(),
        dailyQuestLastResetAt: backendGameState.serverNow || new Date().toISOString(),
        totalCompletedTasks: displayTasks.filter((task) => task.isCompleted).length,
        totalEarnedPoints,
      },
    };
  }

  private async getJson<T>(url: string, init: RequestInit = {}): Promise<T> {
    const response = await this.request(url, init);
    return (await response.json()) as T;
  }

  private async request(url: string, init: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new BackendApiError(response.status, await readErrorMessage(response));
    }

    return response;
  }

}

export class BackendApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

function mapBackendTasks(
  publicTasks: BackendTaskDto[],
  completionTasks: BackendTaskCompletionDto[]
): TaskItem[] {
  const completions = new Map(completionTasks.map((task) => [task.id, task]));

  return publicTasks.map((task, index) => {
    const completion = completions.get(task.id);

    return {
      id: String(task.id),
      title: completion?.title ?? task.title,
      description: task.description || 'Quest fuer dein Pokemon.',
      icon: resolveTaskIcon(index),
      tone: resolveTaskTone(index),
      category: 'delivery',
      isRequired: true,
      checklistReference: `Quest #${task.id}`,
      points: resolveTaskPoints(index),
      isCompleted: completion?.completed ?? false,
    };
  });
}

function resolveTaskIcon(index: number): TaskItem['icon'] {
  return ['coverage', 'test', 'rocket', 'layers', 'docs'][index % 5] as TaskItem['icon'];
}

function resolveTaskTone(index: number): TaskItem['tone'] {
  return ['blue', 'green', 'amber', 'slate', 'green'][index % 5] as TaskItem['tone'];
}

function resolveTaskPoints(index: number): number {
  return [10, 20, 20, 15, 10][index % 5];
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();

  if (!text.trim()) {
    return `Backend request failed with status ${response.status}`;
  }

  try {
    const parsed = JSON.parse(text) as { error?: string; message?: string };
    return parsed.error ?? parsed.message ?? text;
  } catch {
    return text;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
