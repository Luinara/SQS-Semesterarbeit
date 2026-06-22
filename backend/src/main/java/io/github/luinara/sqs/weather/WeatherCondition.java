package io.github.luinara.sqs.weather;

enum WeatherCondition {
    CLEAR("clear", "Klar"),
    CLOUDY("cloudy", "Bewoelkt"),
    RAIN("rain", "Regen"),
    STORM("storm", "Gewitter"),
    SNOW("snow", "Schnee"),
    HAIL("hail", "Hagel"),
    FOG("fog", "Nebel");

    private final String value;
    private final String label;

    WeatherCondition(String value, String label) {
        this.value = value;
        this.label = label;
    }

    String value() {
        return value;
    }

    String label() {
        return label;
    }
}
