package io.github.luinara.sqs.weather;

import io.github.luinara.sqs.weather.dto.WeatherLocationDto;
import io.github.luinara.sqs.weather.dto.WeatherSnapshotDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.beans.factory.annotation.Autowired;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = WeatherController.class)
class WeatherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WeatherService weatherService;

    @Test
    void resolveLocation_returnsLocationFromService() throws Exception {
        when(weatherService.resolveCity("Madrid"))
                .thenReturn(new WeatherLocationDto(40.4165, -3.70256, "Madrid, Spanien"));

        mockMvc.perform(get("/api/weather/location").param("city", "Madrid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").value("Madrid, Spanien"))
                .andExpect(jsonPath("$.latitude").value(40.4165));
    }

    @Test
    void loadCurrentWeather_returnsSnapshotFromService() throws Exception {
        when(weatherService.loadWeather(40.4165, -3.70256, "Madrid, Spanien"))
                .thenReturn(new WeatherSnapshotDto(
                        "clear",
                        "day",
                        22.5,
                        0,
                        "Klar",
                        "Madrid, Spanien",
                        "2026-06-16T07:42:30Z"
                ));

        mockMvc.perform(get("/api/weather/current")
                        .param("latitude", "40.4165")
                        .param("longitude", "-3.70256")
                        .param("label", "Madrid, Spanien"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.condition").value("clear"))
                .andExpect(jsonPath("$.temperatureC").value(22.5));
    }

    @Test
    void weatherApiFailure_returnsBadGateway() throws Exception {
        when(weatherService.resolveCity("Atlantis")).thenThrow(new WeatherApiException("Stadt nicht gefunden."));

        mockMvc.perform(get("/api/weather/location").param("city", "Atlantis"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("Stadt nicht gefunden."));
    }
}
