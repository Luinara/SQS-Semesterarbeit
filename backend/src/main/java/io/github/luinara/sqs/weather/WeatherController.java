package io.github.luinara.sqs.weather;

import io.github.luinara.sqs.weather.dto.WeatherLocationDto;
import io.github.luinara.sqs.weather.dto.WeatherSnapshotDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/location")
    public ResponseEntity<WeatherLocationDto> resolveLocation(@RequestParam("city") String city) {
        return ResponseEntity.ok(weatherService.resolveCity(city));
    }

    @GetMapping("/current")
    public ResponseEntity<WeatherSnapshotDto> loadCurrentWeather(
            @RequestParam("latitude") double latitude,
            @RequestParam("longitude") double longitude,
            @RequestParam("label") String label
    ) {
        return ResponseEntity.ok(weatherService.loadWeather(latitude, longitude, label));
    }

    @ExceptionHandler(WeatherApiException.class)
    public ResponseEntity<Map<String, String>> handleWeatherApiException(WeatherApiException ex) {
        return ResponseEntity.status(502).body(Map.of("error", ex.getMessage()));
    }
}
