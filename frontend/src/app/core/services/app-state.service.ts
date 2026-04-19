import { computed, effect, Injectable, signal } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';
import { MockAccount, StorageSnapshot } from '../../shared/models/app-state.model';
import { AuthResult, LoginCredentials, RegisterCredentials } from '../../shared/models/auth.model';
import { createInitialSnapshot, STORAGE_KEY } from '../../shared/mock/mock-data';
import {
  completeTaskInGameState,
  createRegisteredAccount,
  feedPetInGameState,
  findAccountForLogin,
  hasAccountWithEmail,
  resetGameState,
} from '../state/app-state.logic';
import { PET_RULES } from '../../shared/mock/mock-data';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly snapshot = signal<StorageSnapshot>(this.loadSnapshot());

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
  readonly totalTaskCount = computed(() => this.tasks().length);
  readonly completedTaskCount = computed(
    () => this.tasks().filter((task) => task.isCompleted).length
  );
  readonly feedCost = PET_RULES.feedCost;

  constructor(private readonly browserStorage: BrowserStorageService) {
    // Persistenz wird direkt an die Signal-Aenderungen gekoppelt.
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
      message: `Willkommen zurueck, ${account.user.userName}. Dein Pet hat dich schon vermisst.`,
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
      return {
        ...account,
        gameState: completeTaskInGameState(account.gameState, taskId),
      };
    });
  }

  feedPet(): void {
    this.updateActiveAccount((account) => {
      return {
        ...account,
        gameState: feedPetInGameState(account.gameState),
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
