import { GameState, MockAccount, StorageSnapshot } from '../models/app-state.model';
import { RegisterCredentials } from '../models/auth.model';
import { PokemonSpeciesName, PetState } from '../models/pet.model';
import { TaskItem } from '../models/task.model';
import { AppUser } from '../models/user.model';

export const STORAGE_KEY = 'sqs.frontend.mvp.state';

export const PET_RULES = {
  feedCost: 10,
  growthPerFeeding: 34,
  happinessPerFeeding: 12,
  maxHappiness: 100,
  maxHearts: 3,
  initialGrowthGoal: 100,
  heartRecoveryStep: 0.5,
  heartRecoveryStreakDays: 2,
  dailyHappinessGainLimit: 60,
  happinessDecayPerMissedDay: 18,
  levelUpCooldownHours: 0,
  maxHunger: 100,
  dailyHungerResetValue: 0,
} as const;

export const QUALITY_RULES = {
  targetScore: 80,
  maxScore: 100,
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
    qualityScore: 0,
    qualityTarget: QUALITY_RULES.targetScore,
    qualityLastResetAt: now,
    dailyQuestLastResetAt: now,
    totalCompletedTasks: 0,
    totalEarnedPoints: 0,
  };
}

export function calculateNextGrowthGoal(currentGoal: number): number {
  return Math.round(currentGoal * 1.15) + 8;
}

export function resolvePokemonSpeciesForLevel(level: number): PokemonSpeciesName {
  if (level >= 6) {
    return 'venusaur';
  }

  if (level >= 3) {
    return 'ivysaur';
  }

  return 'bulbasaur';
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
    name: 'Quality Companion',
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
    pokemonSpecies: 'bulbasaur',
  };
}

function createInitialTasks(): TaskItem[] {
  return [
    createQualityTask({
      slug: 'public-endpoint',
      title: 'Oeffentlichen Endpunkt nachweisen',
      description: 'Ein frei erreichbarer Einstieg oder Health-Endpunkt ist fuer die Demo vorhanden.',
      icon: 'endpoint',
      tone: 'blue',
      category: 'architecture',
      checklistReference: 'Themenwahl: mindestens ein oeffentlich erreichbarer Endpunkt',
      points: 8,
    }),
    createQualityTask({
      slug: 'secured-endpoint',
      title: 'Abgesicherten Endpunkt pruefen',
      description: 'Login-Kontext oder Guard ist sichtbar und ein geschuetzter Bereich bleibt nicht anonym nutzbar.',
      icon: 'lock',
      tone: 'rose',
      category: 'security',
      checklistReference: 'Themenwahl: mindestens ein abgesicherter Endpunkt',
      points: 10,
    }),
    createQualityTask({
      slug: 'three-layers',
      title: 'Drei Schichten belegen',
      description: 'Frontend, Backend und Persistenzschicht sind im Projektmodell und in der Doku nachvollziehbar.',
      icon: 'layers',
      tone: 'green',
      category: 'architecture',
      checklistReference: 'Themenwahl: Frontend, Backend, Persistenzschicht',
      points: 10,
    }),
    createQualityTask({
      slug: 'external-service',
      title: 'Externen Service resilient anbinden',
      description: 'PokeAPI und Wetterdaten werden gekapselt geladen und fallen bei Fehlern kontrolliert zurueck.',
      icon: 'api',
      tone: 'blue',
      category: 'integration',
      checklistReference: 'Backend/externer Service: ausfallsichere Architekturpatterns',
      points: 12,
    }),
    createQualityTask({
      slug: 'test-pyramid',
      title: 'Testpyramide abdecken',
      description: 'Unit-, Integration-, E2E-, Security- und Architekturtests sind geplant oder implementiert.',
      icon: 'test',
      tone: 'green',
      category: 'testing',
      checklistReference: 'Qualitaet: komplette Testpyramide',
      points: 14,
    }),
    createQualityTask({
      slug: 'coverage',
      title: '80 Prozent Coverage erreichen',
      description: 'Die statische Analyse und Coverage-Auswertung zeigen keine kritischen offenen Punkte.',
      icon: 'coverage',
      tone: 'amber',
      category: 'testing',
      checklistReference: 'Qualitaet: mindestens 80 Prozent Testabdeckung',
      points: 12,
    }),
    createQualityTask({
      slug: 'pipeline',
      title: 'GitHub Pipeline lauffaehig halten',
      description: 'Typecheck, Tests, Linting und Build sind als CI-faehiger Qualitaetsnachweis nutzbar.',
      icon: 'pipeline',
      tone: 'blue',
      category: 'delivery',
      checklistReference: 'Qualitaet: lauffaehige Github-Pipeline',
      points: 10,
    }),
    createQualityTask({
      slug: 'arc42',
      title: 'arc42 und C4 aktualisieren',
      description: 'Architekturdoku, C4-Ueberblick und wichtige Bausteine sind fuer den Vortrag auffindbar.',
      icon: 'docs',
      tone: 'slate',
      category: 'documentation',
      checklistReference: 'Qualitaet: arc42 Standard und C4-Modell',
      points: 8,
    }),
    createQualityTask({
      slug: 'adrs',
      title: 'ADRs fuer Entscheidungen pflegen',
      description: 'Technologie-, API- und Integrationsentscheidungen sind in ADRs nachvollziehbar festgehalten.',
      icon: 'decision',
      tone: 'slate',
      category: 'documentation',
      checklistReference: 'Qualitaet: wichtige Projektentscheidungen in ADRs',
      points: 8,
      isRequired: false,
    }),
    createQualityTask({
      slug: 'two-command-start',
      title: 'Zwei-Befehl-Start demonstrieren',
      description: 'Nach dem Auschecken startet das Projekt ohne manuelle Eingriffe ueber Skript oder Compose.',
      icon: 'rocket',
      tone: 'green',
      category: 'delivery',
      checklistReference: 'Qualitaet: maximal 2 Befehle lauffaehig',
      points: 8,
    }),
  ];
}

function createQualityTask(input: Omit<TaskItem, 'id' | 'isCompleted' | 'isRequired'> & {
  slug: string;
  isRequired?: boolean;
}): TaskItem {
  const { slug, isRequired = true, ...task } = input;

  return {
    id: `quality-${slug}`,
    ...task,
    isRequired,
    isCompleted: false,
  };
}

function createId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${randomPart}`;
}
