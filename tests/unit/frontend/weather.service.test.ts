import { vi } from "vitest";
import { WeatherService } from "../../../frontend/src/app/core/services/weather.service";

const berlinWeatherResponse = {
  current: {
    temperature_2m: 18.2,
    weather_code: 3,
    is_day: 1,
    time: "2026-05-19T13:45",
  },
};

const zurichGeocodingResponse = {
  results: [
    {
      name: "Zürich",
      admin1: "Kanton Zürich",
      country: "Schweiz",
      latitude: 47.36667,
      longitude: 8.55,
    },
  ],
};

describe("WeatherService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(berlinWeatherResponse), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("speichert die gewählte Stadt und nutzt sie für weitere Aktualisierungen", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(berlinWeatherResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(zurichGeocodingResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(berlinWeatherResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(berlinWeatherResponse), { status: 200 }),
      );

    const service = new WeatherService();
    await service.searchCity("Zürich");
    await service.refresh();

    expect(service.location().label).toBe("Zürich, Kanton Zürich, Schweiz");
    expect(localStorage.getItem("sqs-weather-location")).toContain("Zürich");
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("latitude=47.36667"),
    );
  });

  it("lädt eine gespeicherte Stadt beim Start", async () => {
    localStorage.setItem(
      "sqs-weather-location",
      JSON.stringify({
        latitude: 47.36667,
        longitude: 8.55,
        label: "Zürich, Kanton Zürich, Schweiz",
      }),
    );

    const service = new WeatherService();
    await service.refresh();

    expect(service.location().label).toBe("Zürich, Kanton Zürich, Schweiz");
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("latitude=47.36667"),
    );
  });

  it("aktualisiert Wetter Heute automatisch alle fünf Minuten", () => {
    const service = new WeatherService();

    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(service.location().label).toBe("Berlin");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
