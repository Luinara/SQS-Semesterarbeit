import {
  getHydrationProgressPercent,
  getRemainingHydrationMl,
} from "../../../frontend/src/app/pages/dashboard/components/hydration-gauge/hydration-gauge.component";

describe("hydration gauge logic", () => {
  it.each([
    [0, 0, 3000],
    [1500, 50, 1500],
    [3000, 100, 0],
    [3500, 100, 0],
  ])(
    "berechnet Fortschritt und Restmenge für %i ml",
    (waterLevel, expectedProgress, expectedRemaining) => {
      expect(getHydrationProgressPercent(waterLevel)).toBe(expectedProgress);
      expect(getRemainingHydrationMl(waterLevel)).toBe(expectedRemaining);
    },
  );
});
