package io.github.luinara.sqs.weather;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import io.github.luinara.sqs.weather.dto.WeatherLocationDto;
import io.github.luinara.sqs.weather.dto.WeatherSnapshotDto;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WeatherServiceTest {

    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void resolveCity_prefersPopulatedHawaiiLocation() throws IOException {
        startServer("""
                {
                  "results": [
                    {
                      "name": "Hawaii",
                      "admin1": "Hawaii",
                      "country": "Vereinigte Staaten",
                      "latitude": 19.54814,
                      "longitude": -155.66495,
                      "elevation": 3162,
                      "feature_code": "ISL",
                      "population": 185079
                    },
                    {
                      "name": "Hawaii Kai",
                      "admin1": "Hawaii",
                      "country": "Vereinigte Staaten",
                      "latitude": 21.29637,
                      "longitude": -157.70175,
                      "elevation": 3,
                      "feature_code": "PPLX",
                      "population": 30620
                    }
                  ]
                }
                """, forecastBody(26, 0, 1));

        WeatherLocationDto location = serviceForServer().resolveCity("Hawaii");

        assertThat(location.label()).isEqualTo("Hawaii Kai, Hawaii, Vereinigte Staaten");
        assertThat(location.latitude()).isEqualTo(21.29637);
        assertThat(location.longitude()).isEqualTo(-157.70175);
    }

    @Test
    void loadWeather_mapsForecastToSnapshot() throws IOException {
        startServer("""
                {
                  "results": [
                    {
                      "name": "Madrid",
                      "country": "Spanien",
                      "latitude": 40.4165,
                      "longitude": -3.70256,
                      "feature_code": "PPLC"
                    }
                  ]
                }
                """, forecastBody(18.5, 61, 0));

        WeatherSnapshotDto snapshot = serviceForServer().loadWeather(
                40.4165,
                -3.70256,
                "Madrid, Spanien"
        );

        assertThat(snapshot.condition()).isEqualTo("rain");
        assertThat(snapshot.timeOfDay()).isEqualTo("night");
        assertThat(snapshot.temperatureC()).isEqualTo(18.5);
        assertThat(snapshot.weatherCode()).isEqualTo(61);
        assertThat(snapshot.label()).isEqualTo("Regen");
        assertThat(snapshot.locationLabel()).isEqualTo("Madrid, Spanien");
        assertThat(snapshot.updatedAt()).isNotBlank();
    }

    @Test
    void resolveCity_throwsWhenNoLocationExists() throws IOException {
        startServer("{\"results\":[]}", forecastBody(18.5, 3, 1));

        assertThatThrownBy(() -> serviceForServer().resolveCity("Atlantis"))
                .isInstanceOf(WeatherApiException.class)
                .hasMessage("Stadt nicht gefunden.");
    }

    private void startServer(String geocodingBody, String forecastBody) throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/search", exchange -> writeResponse(exchange, 200, geocodingBody));
        server.createContext("/forecast", exchange -> writeResponse(exchange, 200, forecastBody));
        server.start();
    }

    private WeatherService serviceForServer() {
        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        return new WeatherService(
                baseUrl + "/forecast",
                baseUrl + "/search",
                HttpClient.newHttpClient(),
                new ObjectMapper()
        );
    }

    private static String forecastBody(double temperatureC, int weatherCode, int isDay) {
        return """
                {
                  "current": {
                    "temperature_2m": %s,
                    "weather_code": %d,
                    "is_day": %d
                  }
                }
                """.formatted(temperatureC, weatherCode, isDay);
    }

    private static void writeResponse(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }
}
