import {
  mapWeatherCodeToCondition,
  parseWeatherSnapshot,
  resolveWeatherScene,
} from "../../../frontend/src/app/core/state/weather-appearance.logic";

describe("weather-appearance.logic", () => {
  it("ordnet Open-Meteo-Wettercodes den Pet-Hintergründen zu", () => {
    expect(mapWeatherCodeToCondition(0)).toBe("clear");
    expect(mapWeatherCodeToCondition(3)).toBe("cloudy");
    expect(mapWeatherCodeToCondition(61)).toBe("rain");
    expect(mapWeatherCodeToCondition(71)).toBe("snow");
    expect(mapWeatherCodeToCondition(95)).toBe("storm");
    expect(mapWeatherCodeToCondition(96)).toBe("hail");
  });

  it("liest Tag und Nacht aus der Wetter-Heute-Antwort", () => {
    const snapshot = parseWeatherSnapshot(
      {
        current: {
          temperature_2m: 8.4,
          weather_code: 0,
          is_day: 0,
          time: "2026-05-19T23:00",
        },
      },
      "Berlin",
    );

    expect(snapshot.timeOfDay).toBe("night");
    expect(snapshot.temperatureC).toBe(8);
    expect(snapshot.label).toBe("Klar");
    expect(snapshot.updatedAt).toBe("2026-05-19T23:00");
  });

  it("erfindet keine lokale Aktualisierungszeit ohne API-Zeitstempel", () => {
    const snapshot = parseWeatherSnapshot(
      {
        current: {
          temperature_2m: 8.4,
          weather_code: 0,
          is_day: 0,
        },
      },
      "Berlin",
    );

    expect(snapshot.updatedAt).toBeNull();
  });

  it("liefert eine konkrete Szene für Wetter und Tageszeit", () => {
    const scene = resolveWeatherScene({
      condition: "rain",
      timeOfDay: "night",
      temperatureC: 12,
      weatherCode: 61,
      label: "Regen",
      locationLabel: "Berlin",
      updatedAt: "2026-05-19T22:00",
    });

    expect(scene.className).toBe("rain-night");
    expect(scene.description).toContain("12°C");
    expect(scene.badge).toContain("Nacht");
  });

  it("liefert eine eigene Szene für Hagel", () => {
    const scene = resolveWeatherScene({
      condition: "hail",
      timeOfDay: "day",
      temperatureC: 4,
      weatherCode: 96,
      label: "Hagel",
      locationLabel: "Zürich",
      updatedAt: "2026-05-19T14:00",
    });

    expect(scene.className).toBe("hail-day");
    expect(scene.badge).toContain("Hagel");
    expect(scene.description).toContain("Zürich");
  });
});
