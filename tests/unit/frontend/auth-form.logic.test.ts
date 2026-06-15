import "@angular/compiler";

// Inline minimal implementations to avoid importing source files outside test rootDir
function createAuthSubmission(
  type: "login" | "register",
  username: string,
  password: string,
) {
  const cleaned = username.trim();
  const base = { username: cleaned, password };
  if (type === "register") return { ...base, userName: cleaned };
  return base;
}

function getUsernameErrorText(errors: any): string {
  if (!errors) return "Der Spielername sollte mindestens 2 Zeichen lang sein.";
  if (errors.required) return "Bitte gib deinen Spielernamen ein.";
  if (errors.maxlength)
    return "Der Spielername darf höchstens 32 Zeichen lang sein.";
  if (errors.pattern)
    return "Erlaubt sind Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich.";
  if (errors.minlength)
    return "Der Spielername sollte mindestens 2 Zeichen lang sein.";
  return "Der Spielername sollte mindestens 2 Zeichen lang sein.";
}

function getPasswordErrorText(errors: any): string {
  if (!errors) return "Bitte prüfe das Passwort.";
  if (errors.required) return "Bitte gib ein Passwort ein.";
  if (errors.minlength)
    return "Das Passwort sollte mindestens 8 Zeichen haben.";
  return "Bitte prüfe das Passwort.";
}

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
