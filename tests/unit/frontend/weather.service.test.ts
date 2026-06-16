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

const jakutskGeocodingResponse = {
  results: [
    {
      name: "Jakutsk",
      admin1: "Sacha",
      country: "Russland",
      latitude: 62.03114,
      longitude: 129.72289,
    },
  ],
};

const jakutskWeatherResponse = {
  current: {
    temperature_2m: 20.1,
    weather_code: 1,
    is_day: 1,
    time: "2026-06-16T12:00",
  },
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

  it("nutzt den Open-Meteo-Treffer fuer ungenaue Stadteingaben", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(berlinWeatherResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(jakutskGeocodingResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(jakutskWeatherResponse), { status: 200 }),
      );

    const service = new WeatherService();
    await service.searchCity("jakuts");

    expect(service.location().label).toBe("Jakutsk, Sacha, Russland");
    expect(service.snapshot()).toMatchObject({
      locationLabel: "Jakutsk, Sacha, Russland",
      temperatureC: 20,
      weatherCode: 1,
    });
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("name=jakuts"),
    );
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("latitude=62.03114"),
    );
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("longitude=129.72289"),
    );
  });

  it("aktualisiert Wetter Heute automatisch alle zehn Minuten", () => {
    const service = new WeatherService();

    vi.advanceTimersByTime(10 * 60 * 1000);

    expect(service.location().label).toBe("Berlin");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
