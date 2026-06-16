import { Injectable } from '@angular/core';
import { GameState } from '../../shared/models/app-state.model';
import { RegisterCredentials } from '../../shared/models/auth.model';
import { PokemonSpeciesName, StarterPokemonSpeciesName } from '../../shared/models/pet.model';
import { TaskItem } from '../../shared/models/task.model';
import { AppUser } from '../../shared/models/user.model';
import {
  PET_RULES,
  QUALITY_RULES,
  resolvePokemonSpeciesForLevel,
  resolveStarterPokemonSpecies,
} from '../../shared/mock/mock-data';

const BACKEND_UNREACHABLE_MESSAGE =
  'Backend ist gerade nicht erreichbar. Falls Docker frisch gestartet wurde: kurz warten und nochmal probieren.';

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
  currentPokemonId?: number | null;
  isEgg?: boolean;
  pokemonImageUrl: string | null;
  pokemonName?: string | null;
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

  async signup(credentials: RegisterCredentials): Promise<DashboardSnapshot> {
    await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        starterPokemonId: mapStarterPokemonToId(credentials.starterPokemonSpecies),
      }),
    });

    return this.loadDashboard(credentials.username, credentials.starterPokemonSpecies);
  }

  async logout(): Promise<void> {
    await this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async deleteAccount(): Promise<void> {
    await this.request('/api/user/account', {
      method: 'DELETE',
    });
  }

  async loadDashboard(
    username: string,
    starterPokemonSpeciesFallback?: StarterPokemonSpeciesName
  ): Promise<DashboardSnapshot> {
    const [tasks, gameState] = await Promise.all([
      this.getJson<BackendTaskDto[]>('/api/tasks'),
      this.getJson<BackendGameStateDto>('/api/user/game-state'),
    ]);

    return this.createDashboardSnapshot(username, tasks, gameState, starterPokemonSpeciesFallback);
  }

  async completeTask(
    username: string,
    taskId: string,
    starterPokemonSpeciesFallback?: StarterPokemonSpeciesName
  ): Promise<DashboardSnapshot> {
    await this.request(`/api/tasks/${Number(taskId)}/complete`, {
      method: 'POST',
    });

    return this.loadDashboard(username, starterPokemonSpeciesFallback);
  }

  async addWater(
    username: string,
    ml: number,
    starterPokemonSpeciesFallback?: StarterPokemonSpeciesName
  ): Promise<DashboardSnapshot> {
    const gameState = await this.getJson<BackendGameStateDto>('/api/user/water', {
      method: 'POST',
      body: JSON.stringify({ ml }),
    });
    const tasks = await this.getJson<BackendTaskDto[]>('/api/tasks');

    return this.createDashboardSnapshot(username, tasks, gameState, starterPokemonSpeciesFallback);
  }

  async feed(
    username: string,
    starterPokemonSpeciesFallback?: StarterPokemonSpeciesName
  ): Promise<DashboardSnapshot> {
    const gameState = await this.getJson<BackendGameStateDto>('/api/user/feed', {
      method: 'POST',
    });
    const tasks = await this.getJson<BackendTaskDto[]>('/api/tasks');

    return this.createDashboardSnapshot(username, tasks, gameState, starterPokemonSpeciesFallback);
  }

  async testLevelUp(
    username: string,
    starterPokemonSpeciesFallback?: StarterPokemonSpeciesName
  ): Promise<DashboardSnapshot> {
    const gameState = await this.getJson<BackendGameStateDto>('/api/user/test-level-up', {
      method: 'POST',
    });
    const tasks = await this.getJson<BackendTaskDto[]>('/api/tasks');

    return this.createDashboardSnapshot(username, tasks, gameState, starterPokemonSpeciesFallback);
  }

  async testMotivationDecay(
    username: string,
    starterPokemonSpeciesFallback?: StarterPokemonSpeciesName
  ): Promise<DashboardSnapshot> {
    const gameState = await this.getJson<BackendGameStateDto>('/api/user/test-motivation-decay', {
      method: 'POST',
    });
    const tasks = await this.getJson<BackendTaskDto[]>('/api/tasks');

    return this.createDashboardSnapshot(username, tasks, gameState, starterPokemonSpeciesFallback);
  }

  private createDashboardSnapshot(
    username: string,
    tasks: BackendTaskDto[],
    backendGameState: BackendGameStateDto,
    starterPokemonSpeciesFallback?: StarterPokemonSpeciesName
  ): DashboardSnapshot {
    const displayTasks = mapBackendTasks(tasks, backendGameState.tasks ?? []);
    const totalEarnedPoints = displayTasks
      .filter((task) => task.isCompleted)
      .reduce((total, task) => total + task.points, 0);
    const pokemonLevel = Math.max(1, backendGameState.pokemonLevel || 1);
    const pokemonById = resolvePokemonSpeciesById(backendGameState.currentPokemonId);
    const backendPokemonSpecies = normalizePokemonSpeciesName(backendGameState.pokemonName);
    const pokemonSpecies =
      pokemonById ??
      backendPokemonSpecies ??
      resolvePokemonSpeciesForLevel(pokemonLevel, starterPokemonSpeciesFallback ?? 'bulbasaur');
    const starterPokemonSpecies = resolveStarterPokemonSpecies(pokemonSpecies);
    const currentPokemonId =
      backendGameState.currentPokemonId ?? resolvePokemonIdBySpecies(pokemonSpecies);
    const isEgg = backendGameState.isEgg ?? pokemonLevel < 10;
    const normalizedBackendGameState: BackendGameStateDto = {
      ...backendGameState,
      currentPokemonId,
      isEgg,
    };

    return {
      user: {
        id: username,
        email: username,
        userName: username,
        joinedAt: backendGameState.serverNow || new Date().toISOString(),
      },
      backendGameState: normalizedBackendGameState,
      gameState: {
        pet: {
          name: 'Pokémon Partner',
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
          isEgg,
          starterPokemonSpecies,
          pokemonSpecies,
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
    let response: Response;

    try {
      response = await fetch(url, {
        ...init,
        credentials: 'include',
        headers: {
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...(init.headers ?? {}),
        },
      });
    } catch {
      throw new BackendApiError(0, BACKEND_UNREACHABLE_MESSAGE);
    }

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
      description: task.description || 'Quest für dein Pokémon.',
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

function mapStarterPokemonToId(starterPokemonSpecies: StarterPokemonSpeciesName): number {
  const starterPokemonIds: Record<StarterPokemonSpeciesName, number> = {
    bulbasaur: 1,
    charmander: 4,
    squirtle: 7,
  };

  return starterPokemonIds[starterPokemonSpecies];
}

function resolvePokemonSpeciesById(
  pokemonId: number | null | undefined
): PokemonSpeciesName | undefined {
  const pokemonSpeciesById: Record<number, PokemonSpeciesName> = {
    1: 'bulbasaur',
    2: 'ivysaur',
    3: 'venusaur',
    4: 'charmander',
    5: 'charmeleon',
    6: 'charizard',
    7: 'squirtle',
    8: 'wartortle',
    9: 'blastoise',
  };

  return pokemonId == null ? undefined : pokemonSpeciesById[pokemonId];
}

function resolvePokemonIdBySpecies(pokemonSpecies: PokemonSpeciesName): number {
  const pokemonIdBySpecies: Record<PokemonSpeciesName, number> = {
    bulbasaur: 1,
    ivysaur: 2,
    venusaur: 3,
    charmander: 4,
    charmeleon: 5,
    charizard: 6,
    squirtle: 7,
    wartortle: 8,
    blastoise: 9,
  };

  return pokemonIdBySpecies[pokemonSpecies];
}

function normalizePokemonSpeciesName(
  name: string | null | undefined
): PokemonSpeciesName | undefined {
  const normalizedName = name?.trim().toLowerCase();
  const knownSpecies = new Set<PokemonSpeciesName>([
    'bulbasaur',
    'ivysaur',
    'venusaur',
    'charmander',
    'charmeleon',
    'charizard',
    'squirtle',
    'wartortle',
    'blastoise',
  ]);

  return knownSpecies.has(normalizedName as PokemonSpeciesName)
    ? (normalizedName as PokemonSpeciesName)
    : undefined;
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();

  if (!text.trim()) {
    return `Verbindung fehlgeschlagen (${response.status}).`;
  }

  if (isHtmlErrorResponse(response, text)) {
    return createConnectionErrorMessage(response.status);
  }

  try {
    const parsed = JSON.parse(text) as { error?: string; message?: string };
    return parsed.error ?? parsed.message ?? createConnectionErrorMessage(response.status);
  } catch {
    return truncateErrorMessage(text);
  }
}

function isHtmlErrorResponse(response: Response, text: string): boolean {
  const contentType = response.headers.get('Content-Type')?.toLowerCase() ?? '';
  const trimmedText = text.trimStart().toLowerCase();

  return (
    contentType.includes('text/html') ||
    trimmedText.startsWith('<!doctype html') ||
    trimmedText.startsWith('<html')
  );
}

function createConnectionErrorMessage(status: number): string {
  if (status === 404) {
    return BACKEND_UNREACHABLE_MESSAGE;
  }

  if (status >= 500) {
    return 'Server-Fehler. Bitte versuche es gleich noch einmal.';
  }

  return `Verbindung fehlgeschlagen (${status}).`;
}

function truncateErrorMessage(message: string): string {
  const normalizedMessage = message.replace(/\s+/g, ' ').trim();
  const maxLength = 240;

  return normalizedMessage.length > maxLength
    ? `${normalizedMessage.slice(0, maxLength - 3)}...`
    : normalizedMessage;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
