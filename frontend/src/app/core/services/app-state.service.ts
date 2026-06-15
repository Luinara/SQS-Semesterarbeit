import { computed, Injectable, signal } from '@angular/core';
import { AuthResult, LoginCredentials, RegisterCredentials } from '../../shared/models/auth.model';
import { GameFeedback, GameState } from '../../shared/models/app-state.model';
import { PetCareState } from '../../shared/models/pet.model';
import { AppUser } from '../../shared/models/user.model';
import {
  BackendApiError,
  BackendApiService,
  BackendGameStateDto,
  DashboardSnapshot,
} from './backend-api.service';
import { derivePetCareState } from '../state/app-state.logic';

const ACTIVE_USERNAME_STORAGE_KEY = 'sqs.backend.activeUsername';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly activeUser = signal<AppUser | null>(null);
  private readonly activeGameState = signal<GameState | null>(null);
  private readonly activeBackendGameState = signal<BackendGameStateDto | null>(null);
  private readonly isSessionRestoring = signal(false);
  private feedbackClearTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly isAuthenticated = computed(() => this.activeUser() !== null);
  readonly isLoading = computed(() => this.isSessionRestoring());
  readonly user = computed(() => this.activeUser());
  readonly pet = computed(() => this.activeGameState()?.pet ?? null);
  readonly tasks = computed(() => this.activeGameState()?.tasks ?? []);
  readonly backendGameState = computed(() => this.activeBackendGameState());
  readonly waterLevel = computed(() => this.backendGameState()?.waterLevel ?? 0);
  readonly foodLevel = computed(() => this.backendGameState()?.foodLevel ?? 0);
  readonly streak = computed(() => this.backendGameState()?.streak ?? 0);
  readonly serverNow = computed(() => this.backendGameState()?.serverNow ?? null);
  readonly pokemonImageUrl = computed(() => this.backendGameState()?.pokemonImageUrl ?? null);
  readonly qualityScore = computed(() => this.activeGameState()?.qualityScore ?? 0);
  readonly qualityTarget = computed(() => this.activeGameState()?.qualityTarget ?? 0);
  readonly qualityGateReached = computed(() => this.qualityScore() >= this.qualityTarget());
  readonly totalTaskCount = computed(() => this.tasks().length);
  readonly completedTaskCount = computed(
    () => this.tasks().filter((task) => task.isCompleted).length
  );
  readonly feedCost = 1;
  readonly canFeed = computed(() => (this.pet()?.availableFoodPoints ?? 0) > 0);
  readonly petCareState = computed<PetCareState>(() => {
    const gameState = this.activeGameState();

    return gameState ? derivePetCareState(gameState) : 'calm';
  });
  readonly qualityQuestProgress = computed(() => {
    const total = this.totalTaskCount();
    const completed = this.completedTaskCount();
    const pending = Math.max(0, total - completed);

    return {
      completed,
      total,
      pending,
      completedRequired: completed,
      totalRequired: total,
      percentage: total <= 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
  readonly lastGameFeedback = signal<GameFeedback | null>(null);

  constructor(private readonly backendApi: BackendApiService) {}

  async restoreSession(): Promise<boolean> {
    if (this.isAuthenticated()) {
      return true;
    }

    const username = readStoredUsername();

    if (!username) {
      return false;
    }

    this.isSessionRestoring.set(true);

    try {
      this.applyDashboardSnapshot(await this.backendApi.loadDashboard(username));
      return true;
    } catch {
      clearStoredUsername();
      this.clearSession();
      return false;
    } finally {
      this.isSessionRestoring.set(false);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const snapshot = await this.backendApi.login(credentials.username, credentials.password);
      this.applyDashboardSnapshot(snapshot);
      storeUsername(snapshot.user.userName);

      return {
        success: true,
        message: `Willkommen zurueck, ${snapshot.user.userName}.`,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, 'Login fehlgeschlagen. Bitte pruefe Benutzername und Passwort.'),
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResult> {
    try {
      const snapshot = await this.backendApi.signup(credentials.username, credentials.password);
      this.applyDashboardSnapshot(snapshot);
      storeUsername(snapshot.user.userName);

      return {
        success: true,
        message: `Profil erstellt: ${snapshot.user.userName}.`,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, 'Registrierung fehlgeschlagen.'),
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.backendApi.logout();
    } finally {
      clearStoredUsername();
      this.clearSession();
    }
  }

  async completeTask(taskId: string): Promise<void> {
    const username = this.activeUser()?.userName;

    if (!username) {
      return;
    }

    try {
      const before = this.activeGameState();
      const snapshot = await this.backendApi.completeTask(username, taskId);
      this.applyDashboardSnapshot(snapshot);
      this.showFeedback({
        id: createFeedbackId('quest'),
        kind: 'quest',
        message:
          snapshot.gameState.totalCompletedTasks > (before?.totalCompletedTasks ?? 0)
            ? 'Backend-Task erledigt und API-State aktualisiert.'
            : 'Backend-State wurde aktualisiert.',
      });
    } catch (error) {
      this.showFeedback({
        id: createFeedbackId('info'),
        kind: 'info',
        message: getApiErrorMessage(error, 'Task konnte nicht abgeschlossen werden.'),
      });
    }
  }

  async addWater(amountMl: number): Promise<void> {
    const username = this.activeUser()?.userName;

    if (!username) {
      return;
    }

    try {
      const snapshot = await this.backendApi.addWater(username, amountMl);
      this.applyDashboardSnapshot(snapshot);
      this.showFeedback({
        id: createFeedbackId('hydration'),
        kind: 'hydration',
        message: `+${amountMl} ml Wasser im Backend gespeichert.`,
      });
    } catch (error) {
      this.showFeedback({
        id: createFeedbackId('info'),
        kind: 'info',
        message: getApiErrorMessage(error, 'Wasser konnte nicht gespeichert werden.'),
      });
    }
  }

  async feedPet(): Promise<void> {
    const username = this.activeUser()?.userName;

    if (!username) {
      return;
    }

    try {
      const beforeLevel = this.pet()?.level ?? 1;
      const snapshot = await this.backendApi.feed(username);
      this.applyDashboardSnapshot(snapshot);
      this.showFeedback({
        id: createFeedbackId(snapshot.gameState.pet.level > beforeLevel ? 'level-up' : 'feeding'),
        kind: snapshot.gameState.pet.level > beforeLevel ? 'level-up' : 'feeding',
        message:
          snapshot.gameState.pet.level > beforeLevel
            ? `Level-Up auf ${snapshot.gameState.pet.level}.`
            : 'Feed-Punkte wurden im Backend angewendet.',
      });
    } catch (error) {
      this.showFeedback({
        id: createFeedbackId('info'),
        kind: 'info',
        message: getApiErrorMessage(error, 'Pokemon konnte nicht gefuettert werden.'),
      });
    }
  }

  async resetCurrentProgress(): Promise<void> {
    const username = this.activeUser()?.userName;

    if (!username) {
      return;
    }

    try {
      this.applyDashboardSnapshot(await this.backendApi.loadDashboard(username));
      this.showFeedback({
        id: createFeedbackId('info'),
        kind: 'info',
        message: 'Backend-State neu geladen.',
      });
    } catch (error) {
      this.showFeedback({
        id: createFeedbackId('info'),
        kind: 'info',
        message: getApiErrorMessage(error, 'Backend-State konnte nicht neu geladen werden.'),
      });
    }
  }

  private applyDashboardSnapshot(snapshot: DashboardSnapshot): void {
    this.activeUser.set(snapshot.user);
    this.activeGameState.set(snapshot.gameState);
    this.activeBackendGameState.set(snapshot.backendGameState);
  }

  private clearSession(): void {
    this.activeUser.set(null);
    this.activeGameState.set(null);
    this.activeBackendGameState.set(null);
    this.lastGameFeedback.set(null);
  }

  private showFeedback(feedback: GameFeedback): void {
    this.lastGameFeedback.set(feedback);

    if (this.feedbackClearTimeout) {
      clearTimeout(this.feedbackClearTimeout);
    }

    this.feedbackClearTimeout = setTimeout(() => {
      this.lastGameFeedback.set(null);
      this.feedbackClearTimeout = null;
    }, 3600);
  }
}

function readStoredUsername(): string | null {
  return globalThis.localStorage?.getItem(ACTIVE_USERNAME_STORAGE_KEY) || null;
}

function storeUsername(username: string): void {
  globalThis.localStorage?.setItem(ACTIVE_USERNAME_STORAGE_KEY, username);
}

function clearStoredUsername(): void {
  globalThis.localStorage?.removeItem(ACTIVE_USERNAME_STORAGE_KEY);
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof BackendApiError) {
    return error.message;
  }

  return fallback;
}

function createFeedbackId(kind: GameFeedback['kind']): string {
  return `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
