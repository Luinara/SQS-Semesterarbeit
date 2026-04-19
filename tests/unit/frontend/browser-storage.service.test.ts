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

  it("schreibt serialisierte Werte in den localStorage", () => {
    const storageService = new BrowserStorageService();

    storageService.write("demo-key", { ready: true });

    expect(globalThis.localStorage.getItem("demo-key")).toBe('{"ready":true}');
  });
});
