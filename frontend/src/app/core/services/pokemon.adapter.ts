import { PokemonSnapshot, PokemonSpeciesName } from '../../shared/models/pet.model';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

interface PokeApiPokemonResponse {
  id: number;
  name: PokemonSpeciesName;
  sprites?: {
    other?: {
      'official-artwork'?: {
        front_default?: string | null;
      };
    };
    front_default?: string | null;
  };
  types?: Array<{
    type?: {
      name?: string;
    };
  }>;
}

export interface PokemonAdapter {
  loadPokemon(species: PokemonSpeciesName): Promise<PokemonSnapshot>;
}

export class PokeApiPokemonAdapter implements PokemonAdapter {
  async loadPokemon(species: PokemonSpeciesName): Promise<PokemonSnapshot> {
    const response = await fetch(`${POKEAPI_BASE_URL}/${species}`);

    if (!response.ok) {
      throw new Error(`PokeAPI responded with status ${response.status}`);
    }

    const payload = (await response.json()) as PokeApiPokemonResponse;
    const spriteUrl =
      payload.sprites?.other?.['official-artwork']?.front_default ??
      payload.sprites?.front_default ??
      fallbackPokemonBySpecies[species].spriteUrl;

    return {
      id: payload.id,
      name: species,
      displayName: formatPokemonName(payload.name),
      spriteUrl,
      types: payload.types?.map((entry) => entry.type?.name).filter(isString) ?? [],
      source: 'api',
    };
  }
}

export const fallbackPokemonBySpecies: Record<PokemonSpeciesName, PokemonSnapshot> = {
  bulbasaur: {
    id: 1,
    name: 'bulbasaur',
    displayName: 'Bulbasaur',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    types: ['grass', 'poison'],
    source: 'fallback',
  },
  ivysaur: {
    id: 2,
    name: 'ivysaur',
    displayName: 'Ivysaur',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
    types: ['grass', 'poison'],
    source: 'fallback',
  },
  venusaur: {
    id: 3,
    name: 'venusaur',
    displayName: 'Venusaur',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    types: ['grass', 'poison'],
    source: 'fallback',
  },
};

function isString(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

function formatPokemonName(name: string): string {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}
