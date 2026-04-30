import { afterEach, beforeEach, vi } from "vitest";

// Die Tests arbeiten bewusst mit sauberem Browser-Zustand.
// So bleibt jeder Testfall reproduzierbar und haengt nicht an Restdaten
// aus einem vorherigen Lauf.
beforeEach(() => {
  globalThis.localStorage?.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});
