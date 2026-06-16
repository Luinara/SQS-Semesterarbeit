package io.github.luinara.sqs.pokemon;

import java.util.List;
import java.util.Set;

public final class StarterPokemonCatalog {

    private static final List<StarterPokemonSeed> STARTER_POKEMON = List.of(
            new StarterPokemonSeed(1, "bulbasaur", 2, 0),
            new StarterPokemonSeed(2, "ivysaur", 3, 1),
            new StarterPokemonSeed(3, "venusaur", null, 2),
            new StarterPokemonSeed(4, "charmander", 5, 0),
            new StarterPokemonSeed(5, "charmeleon", 6, 1),
            new StarterPokemonSeed(6, "charizard", null, 2),
            new StarterPokemonSeed(7, "squirtle", 8, 0),
            new StarterPokemonSeed(8, "wartortle", 9, 1),
            new StarterPokemonSeed(9, "blastoise", null, 2)
    );

    private StarterPokemonCatalog() {
    }

    public static Set<Integer> allowedStarterIds() {
        return Set.of(1, 4, 7);
    }

    public static List<StarterPokemonSeed> all() {
        return STARTER_POKEMON;
    }

    public static List<StarterPokemonSeed> chainForStarter(int starterPokemonId) {
        return switch (starterPokemonId) {
            case 1 -> STARTER_POKEMON.subList(0, 3);
            case 4 -> STARTER_POKEMON.subList(3, 6);
            case 7 -> STARTER_POKEMON.subList(6, 9);
            default -> List.of();
        };
    }

    public record StarterPokemonSeed(
            int id,
            String name,
            Integer evolutionId,
            int evolutionStage
    ) {
        public String imageUrl() {
            return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/"
                    + "official-artwork/" + id + ".png";
        }
    }
}
