# Testing Structure

Dieser Ordner ist die zentrale Sammelstelle für repository-weite Tests.
Die Anwendung selbst bleibt in `frontend/` und `backend/`, aber die Tests sind bewusst nach Testart getrennt.
Die abgabeorientierte Zuordnung zur Testpyramide steht in `docs/test-pyramid.md`.

| Directory       | Purpose                                              | Primary tools                    |
| --------------- | ---------------------------------------------------- | -------------------------------- |
| `unit/`         | Kleine, isolierte Tests für reine Logik und Services | JUnit 5, Mockito, Vitest         |
| `integration/`  | Integrationsprüfungen über mehrere Schichten hinweg  | Spring Boot Test, Testcontainers |
| `e2e/`          | Browserbasierte Nutzerflüsse                         | Playwright                       |
| `security/`     | Sicherheits- und Zugriffstests                       | MockMvc, Vitest, npm audit       |
| `architecture/` | Architekturregeln und Konformitätschecks             | ArchUnit                         |

## Tooling wiring

- Frontend-Unit-Tests laufen über `frontend/vitest.config.ts`.
- Die Vitest-Tests liegen zentral unter `tests/unit/`.
- Frontend-E2E-Tests laufen über `frontend/playwright.config.ts`.
- Die Playwright-Spezifikationen liegen zentral unter `tests/e2e/`.
- Backend-Tests bleiben technisch unter `backend/src/test/java/`, folgen aber derselben fachlichen Einteilung in Unit-, Integrations- und Architekturtests.

## Aktueller Frontend-Fokus

Die Frontend-Unit-Tests prüfen aktuell vor allem:

- Mock-Daten und Initialzustand
- lokale Speicherlogik
- reine Fachlogik für Login, Task-Abschluss, Pet-Fütterung und Reset
- npm-Lockfile-Guardrails für bekannte Frontend-Supply-Chain-Vorfälle

Der wichtigste Gedanke dabei ist:
Fachregeln sollen ohne Angular-UI testbar sein, damit die Tests schnell, robust und für die CI leicht wartbar bleiben.

## Wetter-API-Testnachweis

Die Temperatur kommt aus der Open-Meteo Forecast API, nicht aus dem
Geocoding-JSON. Der relevante JSON-Pfad ist `current.temperature_2m`.

Manueller Nachweis:

```powershell
cd C:\Workspace\Uni-26\SQS\SQS-Semesterarbeit
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\weather-curl-check.ps1 -City "Hawaii" -RawJson
```

Erwartet wird ein Forecast-JSON mit `current.temperature_2m`, z.B.:

```json
{
  "current": {
    "temperature_2m": 24.7,
    "weather_code": 1,
    "is_day": 1
  }
}
```

Die zugehörige Doku steht in
`docs/04-quality/weather-open-meteo-manual-check.md`.

## Frontend security checks

Der Frontend-npm-Sicherheitscheck ist bewusst auf `frontend/package.json` und `frontend/package-lock.json` begrenzt.

```bash
cd frontend
npm run security:frontend
```

Der Offline-Teil liegt in `tests/unit/frontend/npm-security.test.ts`.
Die fachliche Doku steht in `docs/frontend-npm-security.md`.

## Naming conventions

| Type                | Suffix       | Example                    |
| ------------------- | ------------ | -------------------------- |
| Backend unit        | `*Test.java` | `PokemonServiceTest.java`  |
| Backend integration | `*IT.java`   | `PokemonControllerIT.java` |
| Frontend unit       | `*.test.ts`  | `app-state.logic.test.ts`  |
| Frontend e2e        | `*.spec.ts`  | `user-journey.spec.ts`     |
