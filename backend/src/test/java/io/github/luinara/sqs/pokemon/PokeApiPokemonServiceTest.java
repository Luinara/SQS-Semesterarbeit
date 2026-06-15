package io.github.luinara.sqs.pokemon;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class PokeApiPokemonServiceTest {

    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void fetchPokemon_readsNameAndOfficialArtwork() throws IOException {
        startServer(200, """
                {
                  "id": 4,
                  "name": "charmander",
                  "sprites": {
                    "other": {
                      "official-artwork": {
                        "front_default": "https://img.example.test/charmander.png"
                      }
                    }
                  }
                }
                """);

        PokeApiPokemonService service = serviceForServer(true);
        StarterPokemonCatalog.StarterPokemonSeed fallback =
                new StarterPokemonCatalog.StarterPokemonSeed(4, "fallback", 5, 0);

        PokeApiPokemonService.PokemonDetails details = service.fetchPokemon(4, fallback);

        assertThat(details.id()).isEqualTo(4);
        assertThat(details.name()).isEqualTo("charmander");
        assertThat(details.imageUrl()).isEqualTo("https://img.example.test/charmander.png");
    }

    @Test
    void fetchPokemon_usesFallbackWhenServerFails() throws IOException {
        startServer(500, "{\"error\":\"broken\"}");

        PokeApiPokemonService service = serviceForServer(true);
        StarterPokemonCatalog.StarterPokemonSeed fallback =
                new StarterPokemonCatalog.StarterPokemonSeed(7, "squirtle", 8, 0);

        PokeApiPokemonService.PokemonDetails details = service.fetchPokemon(7, fallback);

        assertThat(details.id()).isEqualTo(7);
        assertThat(details.name()).isEqualTo("squirtle");
        assertThat(details.imageUrl()).isEqualTo(fallback.imageUrl());
    }

    @Test
    void fetchPokemon_usesFallbackWhenDisabled() throws IOException {
        startServer(200, """
                {
                  "id": 1,
                  "name": "bulbasaur-api",
                  "sprites": {
                    "other": {
                      "official-artwork": {
                        "front_default": "https://img.example.test/bulbasaur.png"
                      }
                    }
                  }
                }
                """);

        PokeApiPokemonService service = serviceForServer(false);
        StarterPokemonCatalog.StarterPokemonSeed fallback =
                new StarterPokemonCatalog.StarterPokemonSeed(1, "bulbasaur", 2, 0);

        PokeApiPokemonService.PokemonDetails details = service.fetchPokemon(1, fallback);

        assertThat(details.id()).isEqualTo(1);
        assertThat(details.name()).isEqualTo("bulbasaur");
        assertThat(details.imageUrl()).isEqualTo(fallback.imageUrl());
    }

    private void startServer(int status, String body) throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/pokemon/4", exchange -> writeResponse(exchange, status, body));
        server.createContext("/pokemon/7", exchange -> writeResponse(exchange, status, body));
        server.createContext("/pokemon/1", exchange -> writeResponse(exchange, status, body));
        server.start();
    }

    private PokeApiPokemonService serviceForServer(boolean enabled) {
        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        return new PokeApiPokemonService(
                baseUrl,
                enabled,
                HttpClient.newHttpClient(),
                new ObjectMapper()
        );
    }

    private static void writeResponse(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }
}
