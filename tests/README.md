# Testing Structure

This is the **single location** for all cross-system tests. Backend and frontend no longer have their own test folder hierarchies — all test categories live here.

| Directory      | Purpose                                                                                   | Primary tools |
|----------------|-------------------------------------------------------------------------------------------|---------------|
| `unit/`        | Unit tests for isolated components/classes; also contains the Vitest global setup file    | JUnit 5 + Mockito, Vitest |
| `integration/` | Full-stack integration tests — backend + frontend running together                        | Spring Boot Test, Testcontainers |
| `e2e/`         | Browser-based end-to-end tests covering complete user journeys                            | Playwright |
| `security/`    | Security / auth tests — protected endpoint access, JWT validation, injection checks       | Spring Security Test, OWASP ZAP |
| `architecture/`| Architecture conformance tests (layer dependencies, naming rules)                         | ArchUnit |

## Tooling wiring

- **Vitest** (frontend unit tests) looks for test files in `tests/unit/**/*.{test,spec}.{ts,tsx}` — configured via `frontend/vite.config.ts`
- **Playwright** (e2e) scans `tests/e2e/` — configured via `frontend/playwright.config.ts`
- **Maven Surefire** picks up `**/*Test.java` inside `backend/src/test/java/`
- **Maven Failsafe** picks up `**/*IT.java` inside `backend/src/test/java/`

## Naming conventions

| Type | Suffix | Example |
|------|--------|---------|
| Backend unit | `*Test.java` | `PokemonServiceTest.java` |
| Backend integration | `*IT.java` | `PokemonControllerIT.java` |
| Frontend unit | `*.test.ts(x)` | `pokemonService.test.ts` |
| Frontend e2e | `*.spec.ts` | `homepage.spec.ts` |
