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
  charmander: {
    id: 4,
    name: 'charmander',
    displayName: 'Charmander',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
    types: ['fire'],
    source: 'fallback',
  },
  charmeleon: {
    id: 5,
    name: 'charmeleon',
    displayName: 'Charmeleon',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png',
    types: ['fire'],
    source: 'fallback',
  },
  charizard: {
    id: 6,
    name: 'charizard',
    displayName: 'Charizard',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    types: ['fire', 'flying'],
    source: 'fallback',
  },
  squirtle: {
    id: 7,
    name: 'squirtle',
    displayName: 'Squirtle',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    types: ['water'],
    source: 'fallback',
  },
  wartortle: {
    id: 8,
    name: 'wartortle',
    displayName: 'Wartortle',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png',
    types: ['water'],
    source: 'fallback',
  },
  blastoise: {
    id: 9,
    name: 'blastoise',
    displayName: 'Blastoise',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    types: ['water'],
    source: 'fallback',
  },
};

function isString(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

function formatPokemonName(name: string): string {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}
