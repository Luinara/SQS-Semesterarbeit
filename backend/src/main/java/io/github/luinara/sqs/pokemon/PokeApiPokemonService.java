package io.github.luinara.sqs.pokemon;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class PokeApiPokemonService {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(2);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(3);

    private final String baseUrl;
    private final boolean enabled;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public PokeApiPokemonService(
            @Value("${pokeapi.base-url:https://pokeapi.co/api/v2}") String baseUrl,
            @Value("${pokeapi.enabled:true}") boolean enabled
    ) {
        this(
                baseUrl,
                enabled,
                HttpClient.newBuilder().connectTimeout(CONNECT_TIMEOUT).build(),
                new ObjectMapper()
        );
    }

    PokeApiPokemonService(
            String baseUrl,
            boolean enabled,
            HttpClient httpClient,
            ObjectMapper objectMapper
    ) {
        this.baseUrl = trimTrailingSlash(baseUrl);
        this.enabled = enabled;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    public PokemonDetails fetchPokemon(
            int pokemonId,
            StarterPokemonCatalog.StarterPokemonSeed fallback
    ) {
        if (!enabled) {
            return fallbackDetails(fallback);
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/pokemon/" + pokemonId))
                    .timeout(REQUEST_TIMEOUT)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return fallbackDetails(fallback);
            }

            JsonNode root = objectMapper.readTree(response.body());
            String name = textOrDefault(root.path("name"), fallback.name());
            String imageUrl = textOrDefault(
                    root.path("sprites").path("other").path("official-artwork").path("front_default"),
                    fallback.imageUrl()
            );

            return new PokemonDetails(fallback.id(), name, imageUrl);
        } catch (IOException | IllegalArgumentException ex) {
            return fallbackDetails(fallback);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return fallbackDetails(fallback);
        }
    }

    private static PokemonDetails fallbackDetails(StarterPokemonCatalog.StarterPokemonSeed fallback) {
        return new PokemonDetails(fallback.id(), fallback.name(), fallback.imageUrl());
    }

    private static String textOrDefault(JsonNode node, String fallback) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return fallback;
        }

        String value = node.asText();
        if (value == null || value.isBlank()) {
            return fallback;
        }

        return value;
    }

    private static String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "https://pokeapi.co/api/v2";
        }

        return value.replaceAll("/+$", "");
    }

    public record PokemonDetails(int id, String name, String imageUrl) {
    }
}
