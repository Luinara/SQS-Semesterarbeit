import { StarterPokemonSpeciesName } from './pet.model';

export type AuthMode = 'login' | 'register';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  userName: string;
  starterPokemonSpecies: StarterPokemonSpeciesName;
}

export type AuthSubmission = LoginCredentials | RegisterCredentials;

export interface AuthResult {
  success: boolean;
  message: string;
}
