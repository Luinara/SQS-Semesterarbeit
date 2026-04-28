import { BrowserStorageService } from "../../../frontend/src/app/core/services/browser-storage.service";

describe("BrowserStorageService", () => {
  it("liest gueltige JSON-Werte aus dem localStorage", () => {
    const storageService = new BrowserStorageService();

    globalThis.localStorage.setItem("demo-key", JSON.stringify({ value: 42 }));

    const result = storageService.read("demo-key", { value: 0 });

    expect(result).toEqual({ value: 42 });
  });

  it("liefert den Fallback-Wert bei defektem JSON zurueck", () => {
    const storageService = new BrowserStorageService();

    globalThis.localStorage.setItem("demo-key", "{ungueltig");

    const result = storageService.read("demo-key", { value: 7 });

    expect(result).toEqual({ value: 7 });
  });

  it("liefert den Fallback-Wert, wenn kein Eintrag gespeichert ist", () => {
    const storageService = new BrowserStorageService();

    const result = storageService.read("unknown-key", { value: 13 });

    expect(result).toEqual({ value: 13 });
  });

  it("schreibt serialisierte Werte in den localStorage", () => {
    const storageService = new BrowserStorageService();

    storageService.write("demo-key", { ready: true });

    expect(globalThis.localStorage.getItem("demo-key")).toBe('{"ready":true}');
  });

  it("nutzt den Fallback und schreibt nichts, wenn kein localStorage verfuegbar ist", () => {
    const originalLocalStorage = Object.getOwnPropertyDescriptor(
      globalThis,
      "localStorage",
    );
    Reflect.deleteProperty(globalThis, "localStorage");

    try {
      const storageService = new BrowserStorageService();

      expect(storageService.read("demo-key", { offline: true })).toEqual({
        offline: true,
      });
      expect(() =>
        storageService.write("demo-key", { ready: false }),
      ).not.toThrow();
    } finally {
      if (originalLocalStorage) {
        Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
      }
    }
  });
});
