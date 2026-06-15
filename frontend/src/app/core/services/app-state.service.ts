import { computed, effect, Injectable, signal } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';
import {
  GameFeedback,
  GameState,
  MockAccount,
  StorageSnapshot,
} from '../../shared/models/app-state.model';
import { AuthResult, LoginCredentials, RegisterCredentials } from '../../shared/models/auth.model';
import { PetCareState } from '../../shared/models/pet.model';
import { createInitialSnapshot, HYDRATION_RULES, STORAGE_KEY } from '../../shared/mock/mock-data';
import {
  addHydrationInGameStateWithFeedback,
  completeTaskInGameStateWithFeedback,
  createRegisteredAccount,
  derivePetCareState,
  feedPetInGameStateWithFeedback,
  findAccountForLogin,
  hasAccountWithEmail,
  normalizeGameState,
  resetDailyProgressIfExpired,
  resetGameState,
} from '../state/app-state.logic';
import { PET_RULES } from '../../shared/mock/mock-data';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly snapshot = signal<StorageSnapshot>(this.loadSnapshot());
  private feedbackClearTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly activeAccount = computed(() => {
    const currentSnapshot = this.snapshot();

    return (
      currentSnapshot.accounts.find(
        (account) => account.user.id === currentSnapshot.activeUserId
      ) ?? null
    );
  });

  readonly isAuthenticated = computed(() => this.activeAccount() !== null);
  readonly user = computed(() => this.activeAccount()?.user ?? null);
  readonly pet = computed(() => this.activeAccount()?.gameState.pet ?? null);
  readonly tasks = computed(() => this.activeAccount()?.gameState.tasks ?? []);
  readonly hydrationMl = computed(() => this.activeAccount()?.gameState.hydrationMl ?? 0);
  readonly hydrationGoalMl = computed(
    () => this.activeAccount()?.gameState.hydrationGoalMl ?? 3000
  );
  readonly hydrationGoalReached = computed(() => this.hydrationMl() >= this.hydrationGoalMl());
  readonly totalTaskCount = computed(() => this.tasks().length);
  readonly completedTaskCount = computed(
    () => this.tasks().filter((task) => task.isCompleted).length
  );
  readonly feedCost = PET_RULES.feedCost;
  readonly canFeed = computed(() => (this.pet()?.availableFoodPoints ?? 0) >= this.feedCost);
  readonly petCareState = computed<PetCareState>(() => {
    const activeAccount = this.activeAccount();

    if (!activeAccount) {
      return 'calm';
    }

    return derivePetCareState(activeAccount.gameState);
  });
  readonly dailyQuestProgress = computed(() => {
    const total = this.totalTaskCount();
    const completed = this.completedTaskCount();
    const pending = Math.max(0, total - completed);

    return {
      completed,
      total,
      pending,
      percentage: total <= 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
  readonly lastGameFeedback = signal<GameFeedback | null>(null);

  constructor(private readonly browserStorage: BrowserStorageService) {
    // Persistenz wird direkt an die Signal-Änderungen gekoppelt.
    // So bleibt die Service-API schlank und jede Mutation landet automatisch im localStorage.
    effect(() => {
      this.browserStorage.write(STORAGE_KEY, this.snapshot());
    });
  }

  login(credentials: LoginCredentials): AuthResult {
    const account = findAccountForLogin(this.snapshot().accounts, credentials);

    if (!account) {
      return {
        success: false,
        message:
          'Die Kombination aus E-Mail und Passwort wurde in der lokalen Demo nicht gefunden.',
      };
    }

    this.snapshot.update((currentSnapshot) => ({
      ...currentSnapshot,
      activeUserId: account.user.id,
    }));

    return {
      success: true,
      message: `Willkommen zurück, ${account.user.userName}. Dein Pet hat dich schon vermisst.`,
    };
  }

  register(credentials: RegisterCredentials): AuthResult {
    const emailExists = hasAccountWithEmail(this.snapshot().accounts, credentials.email);

    if (emailExists) {
      return {
        success: false,
        message: 'Zu dieser E-Mail gibt es in der Demo bereits ein lokales Profil.',
      };
    }

    const newAccount = createRegisteredAccount(credentials);

    this.snapshot.update((currentSnapshot) => ({
      accounts: [...currentSnapshot.accounts, newAccount],
      activeUserId: newAccount.user.id,
    }));

    return {
      success: true,
      message: `Schön, dass du da bist, ${newAccount.user.userName}. Dein erstes Pet ist bereit.`,
    };
  }

  logout(): void {
    this.snapshot.update((currentSnapshot) => ({
      ...currentSnapshot,
      activeUserId: null,
    }));
  }

  completeTask(taskId: string): void {
    this.updateActiveAccount((account) => {
      const result = completeTaskInGameStateWithFeedback(account.gameState, taskId);
      this.showFeedback(result.feedback);

      return {
        ...account,
        gameState: result.gameState,
      };
    });
  }

  feedPet(): void {
    this.updateActiveAccount((account) => {
      const result = feedPetInGameStateWithFeedback(account.gameState);
      this.showFeedback(result.feedback);

      return {
        ...account,
        gameState: result.gameState,
      };
    });
  }

  addHydration(amountMl: number): void {
    this.updateActiveAccount((account) => {
      const result = addHydrationInGameStateWithFeedback(account.gameState, amountMl);
      this.showFeedback(result.feedback);

      return {
        ...account,
        gameState: result.gameState,
      };
    });
  }

  resetCurrentProgress(): void {
    this.updateActiveAccount((account) => ({
      ...account,
      gameState: resetGameState(),
    }));
  }

  private loadSnapshot(): StorageSnapshot {
    const savedSnapshot = this.browserStorage.read<StorageSnapshot | null>(STORAGE_KEY, null);

    if (!this.isValidSnapshot(savedSnapshot)) {
      return createInitialSnapshot();
    }

    return this.normalizeSnapshot(savedSnapshot);
  }

  private isValidSnapshot(snapshot: StorageSnapshot | null): snapshot is StorageSnapshot {
    return Boolean(snapshot && Array.isArray(snapshot.accounts) && 'activeUserId' in snapshot);
  }

  private normalizeSnapshot(snapshot: StorageSnapshot): StorageSnapshot {
    return {
      ...snapshot,
      accounts: snapshot.accounts.map((account) => ({
        ...account,
        gameState: this.resetExpiredDailyProgress({
          ...account.gameState,
          hydrationMl: account.gameState.hydrationMl ?? 0,
          hydrationGoalMl: account.gameState.hydrationGoalMl ?? HYDRATION_RULES.dailyGoalMl,
          hydrationLastResetAt: account.gameState.hydrationLastResetAt ?? new Date().toISOString(),
          dailyQuestLastResetAt:
            account.gameState.dailyQuestLastResetAt ??
            account.gameState.hydrationLastResetAt ??
            new Date().toISOString(),
        }),
      })),
    };
  }

  private resetExpiredDailyProgress(gameState: GameState): GameState {
    return resetDailyProgressIfExpired(normalizeGameState(gameState));
  }

  // Das Update des aktiven Kontos kapselt die Array-Manipulation an einer Stelle.
  // Dadurch bleiben die eigentlichen Fachmethoden klein und gut lesbar.
  private updateActiveAccount(mapAccount: (account: MockAccount) => MockAccount): void {
    const activeAccount = this.activeAccount();

    if (!activeAccount) {
      return;
    }

    const normalizedAccount: MockAccount = {
      ...activeAccount,
      gameState: this.resetExpiredDailyProgress(activeAccount.gameState),
    };

    this.snapshot.update((currentSnapshot) => ({
      ...currentSnapshot,
      accounts: currentSnapshot.accounts.map((account) =>
        account.user.id === activeAccount.user.id ? mapAccount(normalizedAccount) : account
      ),
    }));
  }

  private showFeedback(feedback: GameFeedback | null): void {
    if (!feedback) {
      return;
    }

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
