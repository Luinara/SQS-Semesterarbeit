# Testing Structure

Dieser Ordner ist die zentrale Sammelstelle fuer repository-weite Tests.
Die Anwendung selbst bleibt in `frontend/` und `backend/`, aber die Tests sind bewusst nach Testart getrennt.

| Directory       | Purpose                                               | Primary tools                    |
| --------------- | ----------------------------------------------------- | -------------------------------- |
| `unit/`         | Kleine, isolierte Tests fuer reine Logik und Services | JUnit 5, Mockito, Vitest         |
| `integration/`  | Integrationspruefungen ueber mehrere Schichten hinweg | Spring Boot Test, Testcontainers |
| `e2e/`          | Browserbasierte Nutzerfluesse                         | Playwright                       |
| `security/`     | Sicherheits- und Zugriffstests                        | Spring Security Test, OWASP ZAP  |
| `architecture/` | Architekturregeln und Konformitaetschecks             | ArchUnit                         |

## Tooling wiring

- Frontend-Unit-Tests laufen ueber `frontend/vitest.config.ts`.
- Die Vitest-Tests liegen zentral unter `tests/unit/`.
- Frontend-E2E-Tests laufen ueber `frontend/playwright.config.ts`.
- Die Playwright-Spezifikationen liegen zentral unter `tests/e2e/`.
- Backend-Tests bleiben technisch unter `backend/src/test/java/`, folgen aber derselben fachlichen Einteilung in Unit-, Integrations- und Architekturtests.

## Aktueller Frontend-Fokus

Die Frontend-Unit-Tests pruefen aktuell vor allem:

- Mock-Daten und Initialzustand
- lokale Speicherlogik
- reine Fachlogik fuer Login, Task-Abschluss, Pet-Fuetterung und Reset

Der wichtigste Gedanke dabei ist:
Fachregeln sollen ohne Angular-UI testbar sein, damit die Tests schnell, robust und fuer die CI leicht wartbar bleiben.

## Naming conventions

| Type                | Suffix       | Example                    |
| ------------------- | ------------ | -------------------------- |
| Backend unit        | `*Test.java` | `PokemonServiceTest.java`  |
| Backend integration | `*IT.java`   | `PokemonControllerIT.java` |
| Frontend unit       | `*.test.ts`  | `app-state.logic.test.ts`  |
| Frontend e2e        | `*.spec.ts`  | `placeholder.spec.ts`      |
