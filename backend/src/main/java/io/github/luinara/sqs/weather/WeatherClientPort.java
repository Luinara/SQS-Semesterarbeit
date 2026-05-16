package io.github.luinara.sqs.weather;

public interface WeatherClientPort {
    String getWeather(String location);
}
