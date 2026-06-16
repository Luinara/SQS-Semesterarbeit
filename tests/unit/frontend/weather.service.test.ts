import { vi } from "vitest";
// @ts-ignore: imported source is outside the tests rootDir
import { OpenMeteoWeatherAdapter } from "../../../frontend/src/app/core/services/weather.adapter";
// @ts-ignore: imported source is outside the tests rootDir
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

const hawaiiGeocodingResponse = {
  results: [
    {
      name: "Hawaii",
      admin1: "Hawaii",
      country: "Vereinigte Staaten",
      latitude: 19.54814,
      longitude: -155.66495,
      elevation: 3162,
      feature_code: "ISL",
      population: 185079,
    },
    {
      name: "Hawaii",
      admin1: "Departamento Santa Rosa",
      country: "Guatemala",
      latitude: 13.86036,
      longitude: -90.41127,
      elevation: 9999,
      feature_code: "PPL",
    },
    {
      name: "Hawaii Kai",
      admin1: "Hawaii",
      country: "Vereinigte Staaten",
      latitude: 21.29637,
      longitude: -157.70175,
      elevation: 3,
      feature_code: "PPLX",
      population: 30620,
    },
  ],
};

const hawaiiWeatherResponse = {
  current: {
    temperature_2m: 26,
    weather_code: 0,
    is_day: 1,
    time: "2026-06-16T17:00",
  },
};

const cityComparisonCases = [
  {
    search: "Berlin",
    response: {
      results: [
        {
          name: "Berlin",
          admin1: "Land Berlin",
          country: "Deutschland",
          latitude: 52.52437,
          longitude: 13.41053,
          elevation: 74,
          feature_code: "PPLC",
          population: 3426354,
        },
      ],
    },
    expectedLabel: "Berlin, Land Berlin, Deutschland",
    expectedLatitude: 52.52437,
  },
  {
    search: "Los Angeles",
    response: {
      results: [
        {
          name: "Los Angeles",
          admin1: "Kalifornien",
          country: "Vereinigte Staaten",
          latitude: 34.05223,
          longitude: -118.24368,
          elevation: 89,
          feature_code: "PPLA2",
          population: 3820914,
        },
      ],
    },
    expectedLabel: "Los Angeles, Kalifornien, Vereinigte Staaten",
    expectedLatitude: 34.05223,
  },
  {
    search: "Tokyo",
    response: {
      results: [
        {
          name: "Tokio",
          admin1: "Tokio",
          country: "Japan",
          latitude: 35.6895,
          longitude: 139.69171,
          elevation: 44,
          feature_code: "PPLC",
          population: 9733276,
        },
        {
          name: "Tokyo",
          admin1: "Central Province",
          country: "Papua-Neuguinea",
          latitude: -8.4,
          longitude: 147.15,
          elevation: 2047,
          feature_code: "PPL",
        },
      ],
    },
    expectedLabel: "Tokio, Tokio, Japan",
    expectedLatitude: 35.6895,
  },
  {
    search: "Jakarta",
    response: {
      results: [
        {
          name: "Jakarta",
          admin1: "Jakarta",
          country: "Indonesien",
          latitude: -6.21462,
          longitude: 106.84513,
          elevation: 16,
          feature_code: "PPLC",
          population: 8540121,
        },
      ],
    },
    expectedLabel: "Jakarta, Jakarta, Indonesien",
    expectedLatitude: -6.21462,
  },
  {
    search: "Hawaii",
    response: hawaiiGeocodingResponse,
    expectedLabel: "Hawaii Kai, Hawaii, Vereinigte Staaten",
    expectedLatitude: 21.29637,
  },
];

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

  it("migriert den alten Hawaii-Inselpunkt aus dem Browser-Speicher", async () => {
    localStorage.setItem(
      "sqs-weather-location",
      JSON.stringify({
        latitude: 19.54814,
        longitude: -155.66495,
        label: "Hawaii, Hawaii, Vereinigte Staaten",
      }),
    );

    const service = new WeatherService();
    await service.refresh();

    expect(service.location().label).toBe(
      "Hawaii Kai, Hawaii, Vereinigte Staaten",
    );
    expect(localStorage.getItem("sqs-weather-location")).toContain(
      "Hawaii Kai",
    );
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("latitude=21.29637"),
    );
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("longitude=-157.70175"),
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
      temperatureC: 20.1,
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

  it("bevorzugt bei Hawaii einen bewohnten Ort statt des kalten Inselmittelpunkts", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(berlinWeatherResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(hawaiiGeocodingResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(hawaiiWeatherResponse), { status: 200 }),
      );

    const service = new WeatherService();
    await service.searchCity("Hawaii");

    expect(service.location().label).toBe(
      "Hawaii Kai, Hawaii, Vereinigte Staaten",
    );
    expect(service.snapshot()).toMatchObject({
      condition: "clear",
      locationLabel: "Hawaii Kai, Hawaii, Vereinigte Staaten",
      temperatureC: 26,
    });
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("count=10"),
    );
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("latitude=21.29637"),
    );
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("longitude=-157.70175"),
    );
  });

  it("vergleicht wichtige Weltstadt-Suchen mit dem erwarteten Open-Meteo-Treffer", async () => {
    const adapter = new OpenMeteoWeatherAdapter();

    for (const cityCase of cityComparisonCases) {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(cityCase.response), { status: 200 }),
      );

      const location = await adapter.resolveCity(cityCase.search);

      expect(location.label).toBe(cityCase.expectedLabel);
      expect(location.latitude).toBe(cityCase.expectedLatitude);
    }

    expect(fetch).toHaveBeenCalledTimes(cityComparisonCases.length);
    for (const [url] of vi.mocked(fetch).mock.calls) {
      expect(url).toEqual(expect.stringContaining("count=10"));
    }
  });

  it("aktualisiert Wetter Heute automatisch alle zehn Minuten", () => {
    const service = new WeatherService();

    vi.advanceTimersByTime(10 * 60 * 1000);

    expect(service.location().label).toBe("Berlin");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("setzt beim Aktualisieren die aktuelle Refresh-Zeit statt der Open-Meteo-Wetterzeit", async () => {
    vi.setSystemTime(new Date("2026-06-16T07:42:30.000Z"));
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            current: {
              temperature_2m: 18.2,
              weather_code: 3,
              is_day: 1,
              time: "2026-06-16T05:30",
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const service = new WeatherService();
    await service.refresh();

    expect(service.snapshot()?.updatedAt).toBe("2026-06-16T07:42:30.000Z");
    expect(service.snapshot()?.updatedAt).not.toBe("2026-06-16T05:30");
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("elevation=nan"),
    );
  });
});
