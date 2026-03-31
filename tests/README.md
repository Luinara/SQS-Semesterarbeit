# Testing Structure

This directory contains cross-system tests that require the full stack to be running.

| Directory      | Purpose                                                                              |
|----------------|--------------------------------------------------------------------------------------|
| `unit/`        | Shared unit-test helpers or fixtures used by both backend and frontend               |
| `integration/` | Full-stack integration tests — backend + frontend running together                   |
| `e2e/`         | Browser-based end-to-end tests (Playwright) covering complete user journeys          |
| `security/`    | Security / penetration tests — auth flows, protected endpoint access, injection checks |
| `architecture/`| Architecture conformance tests (e.g. ArchUnit rules for the overall system)          |

## Where tests live

| Scope | Location | Tool |
|---|---|---|
| Backend unit tests | `backend/src/test/java/.../unit/` | JUnit 5 + Mockito |
| Backend integration tests | `backend/src/test/java/.../integration/` | Spring Boot Test + H2 |
| Backend security tests | `backend/src/test/java/.../security/` | Spring Security Test |
| Backend architecture tests | `backend/src/test/java/.../architecture/` | ArchUnit |
| Frontend unit tests | `frontend/tests/unit/` | Vitest + Testing Library |
| Frontend e2e tests | `frontend/tests/e2e/` | Playwright |
| Cross-system integration | `tests/integration/` | Custom / Testcontainers |
| Cross-system e2e | `tests/e2e/` | Playwright |
| Cross-system security | `tests/security/` | OWASP ZAP / custom |
| Cross-system architecture | `tests/architecture/` | ArchUnit / custom |
