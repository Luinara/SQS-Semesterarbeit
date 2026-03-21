# Testing Structure

This directory documents the overall testing strategy for the project.

| Directory      | Purpose                                                                  |
|----------------|--------------------------------------------------------------------------|
| `unit/`        | Reserved for cross-cutting unit-test helpers/fixtures shared between backend and frontend |
| `integration/` | End-to-end integration tests that require both backend **and** frontend running together |
| `e2e/`         | Browser-based UI tests (Playwright); also located under `frontend/tests/e2e/` |
| `performance/` | Load and performance tests (e.g. k6, Gatling) – planned for future work   |

## Where tests live

- **Backend unit tests** → `backend/src/test/java/.../unit/`
- **Backend integration tests** → `backend/src/test/java/.../integration/`
- **Frontend unit tests** → `frontend/tests/unit/`
- **Frontend integration tests** → `frontend/tests/integration/`
- **Frontend e2e / UI tests** → `frontend/tests/e2e/`
- **Full-stack integration & performance** → `tests/integration/`, `tests/performance/`
