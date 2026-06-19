package io.github.luinara.sqs.weather.dto;

public record WeatherSnapshotDto(
        String condition,
        String timeOfDay,
        double temperatureC,
        int weatherCode,
        String label,
        String locationLabel,
        String updatedAt
) {
}
