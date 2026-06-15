export interface PetState {
  name: string;
  level: number;
  growthProgress: number;
  growthGoal: number;
  availableFoodPoints: number;
  happiness: number;
  hunger: number;
  hearts: number;
  mealsServed: number;
  dailyHappinessGained: number;
  happinessGainLastResetAt: string;
  lastFedAt: string | null;
  lastHappinessDecayAt: string | null;
  lastLevelUpAt: string | null;
  goodCareStreakDays: number;
  lastGoodCareDay: string | null;
}

export type PetCareState = 'needs-care' | 'ready-to-feed' | 'growing' | 'thriving' | 'calm';
