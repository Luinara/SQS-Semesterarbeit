import { formatWeatherUpdatedAtTime } from "../../../frontend/src/app/pages/dashboard/components/pet-card/pet-card.component";

describe("weather timestamp formatting", () => {
  it("formatiert den lokalen Aktualisierungszeitpunkt für die Wetteranzeige", () => {
    const updatedAt = "2026-05-19T13:45:00.000Z";
    const expectedTime = new Intl.DateTimeFormat("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(updatedAt));

    expect(formatWeatherUpdatedAtTime(updatedAt)).toBe(`${expectedTime} Uhr`);
  });
});
