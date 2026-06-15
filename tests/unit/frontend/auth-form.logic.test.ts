import "@angular/compiler";
import {
  createAuthSubmission,
  getPasswordErrorText,
  getUsernameErrorText,
} from "../../../frontend/src/app/pages/auth/auth-form/auth-form.component";

describe("auth-form logic", () => {
  it("erstellt Login-Payloads mit bereinigtem Spielernamen", () => {
    expect(createAuthSubmission("login", "  demo  ", "secret123")).toEqual({
      username: "demo",
      password: "secret123",
    });
  });

  it("erstellt Registrierungs-Payloads mit userName aus dem Spielernamen", () => {
    expect(createAuthSubmission("register", "  nova  ", "password123")).toEqual(
      {
        username: "nova",
        password: "password123",
        userName: "nova",
      },
    );
  });

  it.each([
    [{ required: true }, "Bitte gib deinen Spielernamen ein."],
    [
      { maxlength: true },
      "Der Spielername darf höchstens 32 Zeichen lang sein.",
    ],
    [
      { pattern: true },
      "Erlaubt sind Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich.",
    ],
    [
      { minlength: true },
      "Der Spielername sollte mindestens 2 Zeichen lang sein.",
    ],
    [null, "Der Spielername sollte mindestens 2 Zeichen lang sein."],
  ])("liefert passende Spielernamen-Fehlertexte", (errors, expected) => {
    expect(getUsernameErrorText(errors)).toBe(expected);
  });

  it.each([
    [{ required: true }, "Bitte gib ein Passwort ein."],
    [{ minlength: true }, "Das Passwort sollte mindestens 8 Zeichen haben."],
    [null, "Bitte prüfe das Passwort."],
  ])("liefert passende Passwort-Fehlertexte", (errors, expected) => {
    expect(getPasswordErrorText(errors)).toBe(expected);
  });
});
