import { formatWeatherApiTime } from "../../../frontend/src/app/pages/dashboard/components/pet-card/pet-card.component";

describe("weather timestamp formatting", () => {
  it("zeigt die Uhrzeit direkt aus dem Open-Meteo-Zeitstempel an", () => {
    expect(formatWeatherApiTime("2026-05-19T13:45")).toBe("13:45 Uhr");
  });
});
