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
  isEgg: boolean;
  starterPokemonSpecies: StarterPokemonSpeciesName;
  pokemonSpecies: PokemonSpeciesName;
}

export type PetCareState = 'needs-care' | 'ready-to-feed' | 'growing' | 'thriving' | 'calm';
export type StarterPokemonSpeciesName = 'bulbasaur' | 'charmander' | 'squirtle';
export type PokemonSpeciesName =
  | 'bulbasaur'
  | 'ivysaur'
  | 'venusaur'
  | 'charmander'
  | 'charmeleon'
  | 'charizard'
  | 'squirtle'
  | 'wartortle'
  | 'blastoise';
export type PokemonSource = 'api' | 'fallback';

export interface PokemonSnapshot {
  id: number;
  name: PokemonSpeciesName;
  displayName: string;
  spriteUrl: string;
  types: string[];
  source: PokemonSource;
}
