import { computed, Injectable, signal } from '@angular/core';
import { PokemonSnapshot, PokemonSpeciesName } from '../../shared/models/pet.model';
import { resolvePokemonSpeciesForLevel } from '../../shared/mock/mock-data';
import {
  fallbackPokemonBySpecies,
  PokeApiPokemonAdapter,
  PokemonAdapter,
} from './pokemon.adapter';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly pokemonAdapter: PokemonAdapter = new PokeApiPokemonAdapter();
  private readonly cache = new Map<PokemonSpeciesName, PokemonSnapshot>();
  readonly snapshot = signal<PokemonSnapshot>(fallbackPokemonBySpecies.bulbasaur);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly sourceLabel = computed(() =>
    this.snapshot().source === 'api' ? 'Live-Sprite' : 'Lokaler Fallback'
  );

  async loadForLevel(level: number): Promise<void> {
    await this.loadSpecies(resolvePokemonSpeciesForLevel(level));
  }

  async loadSpecies(species: PokemonSpeciesName): Promise<void> {
    const cachedPokemon = this.cache.get(species);

    if (cachedPokemon) {
      this.snapshot.set(cachedPokemon);
      this.errorMessage.set(null);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const pokemon = await this.pokemonAdapter.loadPokemon(species);
      this.cache.set(species, pokemon);
      this.snapshot.set(pokemon);
    } catch {
      const fallbackPokemon = fallbackPokemonBySpecies[species];
      this.cache.set(species, fallbackPokemon);
      this.snapshot.set(fallbackPokemon);
      this.errorMessage.set('Pokemon-Sprite ist gerade nicht erreichbar. Fallback aktiv.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
