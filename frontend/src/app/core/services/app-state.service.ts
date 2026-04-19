import { computed, effect, Injectable, signal } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';
import { GameState, MockAccount, StorageSnapshot } from '../../shared/models/app-state.model';
import { AuthResult, LoginCredentials, RegisterCredentials } from '../../shared/models/auth.model';
import {
  calculateNextGrowthGoal,
  createInitialGameState,
  createInitialSnapshot,
  createMockAccount,
  normalizeEmail,
  PET_RULES,
  STORAGE_KEY,
} from '../../shared/mock/mock-data';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly snapshot = signal<StorageSnapshot>(this.loadSnapshot());

  readonly activeAccount = computed(() => {
    const currentSnapshot = this.snapshot();

    return currentSnapshot.accounts.find((account) => account.user.id === currentSnapshot.activeUserId) ?? null;
  });

  readonly isAuthenticated = computed(() => this.activeAccount() !== null);
  readonly user = computed(() => this.activeAccount()?.user ?? null);
  readonly pet = computed(() => this.activeAccount()?.gameState.pet ?? null);
  readonly tasks = computed(() => this.activeAccount()?.gameState.tasks ?? []);
  readonly totalTaskCount = computed(() => this.tasks().length);
  readonly completedTaskCount = computed(() => this.tasks().filter((task) => task.isCompleted).length);
  readonly feedCost = PET_RULES.feedCost;

  constructor(private readonly browserStorage: BrowserStorageService) {
    // Persistenz wird direkt an die Signal-Aenderungen gekoppelt.
    // So bleibt die Service-API schlank und jede Mutation landet automatisch im localStorage.
    effect(() => {
      this.browserStorage.write(STORAGE_KEY, this.snapshot());
    });
  }

  login(credentials: LoginCredentials): AuthResult {
    const normalizedEmail = normalizeEmail(credentials.email);
    const account = this.snapshot().accounts.find(
      (entry) => entry.user.email === normalizedEmail && entry.password === credentials.password
    );

    if (!account) {
      return {
        success: false,
        message: 'Die Kombination aus E-Mail und Passwort wurde in der lokalen Demo nicht gefunden.',
      };
    }

    this.snapshot.update((currentSnapshot) => ({
      ...currentSnapshot,
      activeUserId: account.user.id,
    }));

    return {
      success: true,
      message: `Willkommen zurueck, ${account.user.userName}. Dein Pet hat dich schon vermisst.`,
    };
  }

  register(credentials: RegisterCredentials): AuthResult {
    const normalizedEmail = normalizeEmail(credentials.email);
    const emailExists = this.snapshot().accounts.some((account) => account.user.email === normalizedEmail);

    if (emailExists) {
      return {
        success: false,
        message: 'Zu dieser E-Mail gibt es in der Demo bereits ein lokales Profil.',
      };
    }

    const newAccount = createMockAccount({
      ...credentials,
      email: normalizedEmail,
      userName: credentials.userName.trim(),
    });

    this.snapshot.update((currentSnapshot) => ({
      accounts: [...currentSnapshot.accounts, newAccount],
      activeUserId: newAccount.user.id,
    }));

    return {
      success: true,
      message: `Schoen, dass du da bist, ${newAccount.user.userName}. Dein erstes Pet ist bereit.`,
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
      const taskToComplete = account.gameState.tasks.find((task) => task.id === taskId && !task.isCompleted);

      if (!taskToComplete) {
        return account;
      }

      return {
        ...account,
        gameState: {
          ...account.gameState,
          tasks: account.gameState.tasks.map((task) =>
            task.id === taskId ? { ...task, isCompleted: true } : task
          ),
          totalCompletedTasks: account.gameState.totalCompletedTasks + 1,
          totalEarnedPoints: account.gameState.totalEarnedPoints + taskToComplete.points,
          pet: {
            ...account.gameState.pet,
            availableFoodPoints: account.gameState.pet.availableFoodPoints + taskToComplete.points,
            happiness: Math.min(PET_RULES.maxHappiness, account.gameState.pet.happiness + 4),
            hearts: Math.min(PET_RULES.maxHearts, account.gameState.pet.hearts + 1),
          },
        },
      };
    });
  }

  feedPet(): void {
    this.updateActiveAccount((account) => {
      const currentPet = account.gameState.pet;

      if (currentPet.availableFoodPoints < PET_RULES.feedCost) {
        return account;
      }

      let nextLevel = currentPet.level;
      let nextGrowthGoal = currentPet.growthGoal;
      let nextGrowthProgress = currentPet.growthProgress + PET_RULES.growthPerFeeding;
      let nextHappiness = Math.min(PET_RULES.maxHappiness, currentPet.happiness + 8);

      while (nextGrowthProgress >= nextGrowthGoal) {
        nextGrowthProgress -= nextGrowthGoal;
        nextLevel += 1;
        nextGrowthGoal = calculateNextGrowthGoal(nextGrowthGoal);
        nextHappiness = Math.min(PET_RULES.maxHappiness, nextHappiness + 6);
      }

      return {
        ...account,
        gameState: {
          ...account.gameState,
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
        },
      };
    });
  }

  resetCurrentProgress(): void {
    this.updateActiveAccount((account) => ({
      ...account,
      gameState: createInitialGameState(),
    }));
  }

  private loadSnapshot(): StorageSnapshot {
    const savedSnapshot = this.browserStorage.read<StorageSnapshot | null>(STORAGE_KEY, null);

    if (!this.isValidSnapshot(savedSnapshot)) {
      return createInitialSnapshot();
    }

    return savedSnapshot;
  }

  private isValidSnapshot(snapshot: StorageSnapshot | null): snapshot is StorageSnapshot {
    return Boolean(snapshot && Array.isArray(snapshot.accounts) && 'activeUserId' in snapshot);
  }

  // Das Update des aktiven Kontos kapselt die Array-Manipulation an einer Stelle.
  // Dadurch bleiben die eigentlichen Fachmethoden klein und gut lesbar.
  private updateActiveAccount(mapAccount: (account: MockAccount) => MockAccount): void {
    const activeAccount = this.activeAccount();

    if (!activeAccount) {
      return;
    }

    this.snapshot.update((currentSnapshot) => ({
      ...currentSnapshot,
      accounts: currentSnapshot.accounts.map((account) =>
        account.user.id === activeAccount.user.id ? mapAccount(account) : account
      ),
    }));
  }
}
