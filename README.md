# SQS-Semesterarbeit

Semester project for a Software Quality Assurance course, focused on developing a self-care companion web application with an emphasis on high software quality standards.

---

## Project Structure

```
SQS-Semesterarbeit/
├── backend/                          # Java / Spring Boot backend
│   └── src/
│       ├── main/
│       │   ├── java/com/example/app/
│       │   │   ├── config/           # Spring configuration and security
│       │   │   ├── controller/       # REST endpoints (public + secured)
│       │   │   ├── service/          # Business logic
│       │   │   ├── domain/           # Core models (user, task, pokemon, …)
│       │   │   ├── repository/       # Data access layer (Spring Data JPA)
│       │   │   └── integration/      # External service communication (PokeAPI)
│       │   └── resources/
│       │       ├── application.properties      # Base configuration
│       │       └── application-dev.properties  # Development overrides
│       └── test/
│           └── resources/
│               └── application-test.properties # Test datasource (H2)
│
├── frontend/                         # TypeScript / React frontend
│   ├── src/
│   │   ├── api/                      # Backend communication layer
│   │   ├── components/               # Reusable UI elements
│   │   └── pages/                    # Routing-level views
│   ├── public/                       # Static assets
│   ├── .env.example                  # Environment variable template
│   ├── package.json
│   ├── playwright.config.ts          # Playwright → points at tests/e2e/
│   ├── tsconfig.json
│   └── vite.config.ts                # Vite / Vitest → points at tests/unit/
│
├── tests/                            # ALL tests live here (single source of truth)
│   ├── unit/                         # Unit tests + Vitest setup file
│   ├── integration/                  # Full-stack integration tests
│   ├── e2e/                          # Browser end-to-end tests (Playwright)
│   ├── security/                     # Auth / protected endpoint / security tests
│   └── architecture/                 # Architecture conformance tests (ArchUnit)
│
├── docs/                             # Project documentation
│   ├── arc42/                        # Architecture documentation (arc42 template)
│   ├── adr/                          # Architecture Decision Records
│   └── diagrams/                     # System and component diagrams
│
├── infrastructure/                   # Deployment and environment configuration
├── scripts/                          # Setup and start scripts
│   ├── setup.sh                      # Install all dependencies
│   └── start.sh                      # Start the full stack via Docker Compose
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI/CD pipeline
├── docker-compose.yml                # Local full-stack environment
└── README.md
```

---

## Technology Stack

| Layer              | Technology                                      |
|--------------------|-------------------------------------------------|
| Backend            | Java 21, Spring Boot 3, Spring Data JPA         |
| Security           | Spring Security (JWT / session-based)           |
| Database           | PostgreSQL (H2 in-memory for tests)             |
| External service   | PokeAPI (https://pokeapi.co)                    |
| Frontend           | TypeScript, React 18, Vite                      |
| Unit tests         | JUnit 5 + Mockito (backend), Vitest (frontend)  |
| Architecture tests | ArchUnit                                        |
| E2E tests          | Playwright                                      |
| CI/CD              | GitHub Actions                                  |

---

## Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- Maven 3.9+
- Docker + Docker Compose (for the full stack)

### Quick start with Docker Compose

```bash
./scripts/setup.sh   # install dependencies
./scripts/start.sh   # build images and start all services
```

Frontend → http://localhost:3000  
Backend API → http://localhost:8080

### Manual start

**Backend**

```bash
cd backend
cp src/main/resources/application.properties src/main/resources/application-local.properties
# Edit application-local.properties with your database credentials
mvn spring-boot:run
```

**Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## Running Tests

All tests live in `tests/`. Tooling is wired automatically:

```bash
# Backend unit tests  (**/*UserTest.java  via Maven Surefire)
cd backend && mvn test

# Backend integration tests  (**/*IT.java  via Maven Failsafe)
cd backend && mvn verify

# Frontend unit tests  (tests/unit/**/*.{test,spec}.{ts,tsx}  via Vitest)
cd frontend && npm test

# E2E tests  (tests/e2e/**/*.spec.ts  via Playwright)
cd frontend && npm run test:e2e
```

See [`tests/README.md`](tests/README.md) for full details on naming conventions and test runners.

---

## Documentation

Architecture documentation lives in [`docs/`](docs/):

- [`docs/arc42/`](docs/arc42/) – arc42 architecture documentation
- [`docs/adr/`](docs/adr/) – Architecture Decision Records
- [`docs/diagrams/`](docs/diagrams/) – System and component diagrams

# Project Roadmap & TODOs

## Project Setup (Bootstrap Phase)

* [x] Set up CI/CD pipeline (GitHub Actions)
* [x] Integrate static analysis (Checkstyle, SpotBugs, ESLint, Prettier)
* [x] Prepare SonarQube integration (analysis + coverage reporting)
* [ ] Enable SonarQube Quality Gate (later phase)
* [ ] Define coding conventions and project structure

---

## Frontend (React + TypeScript)

* [ ] Create UI design in Figma

    * [ ] Landing page (public endpoint)
    * [ ] Login / Sign-up page
    * [ ] Pokémon task dashboard
* [ ] Implement component structure (clean separation of concerns)
* [ ] Connect frontend to backend API
* [ ] Add frontend unit tests (Vitest)
* [ ] Add E2E tests (Playwright user flows)
  > **TODO:** `tests/e2e/placeholder.spec.ts` is a temporary smoke test that
  > only checks the app loads. It must be replaced with real user-flow tests
  > once the application features are implemented (login, task dashboard, etc.).

---

## Backend (Spring Boot)

* [ ] Define layered architecture (Controller / Service / Repository)
* [ ] Implement REST endpoints

    * [ ] Public endpoint (e.g. landing / health)
    * [ ] Protected endpoints (user + tasks)
* [ ] Implement authentication (login & signup)
* [ ] Implement business logic (task tracking → Pokémon progression)
* [ ] Integrate external service (PokeAPI)
* [ ] Add resilience (timeouts, retries, fallback handling)

---

## Data & Persistence

* [ ] Design database schema

    * [ ] User entity
    * [ ] Task entity (completion tracking)
    * [ ] Pokémon / progression model
* [ ] Implement JPA repositories
* [ ] Add integration tests with H2 database

---

## API Design

* [ ] Define API contract (request/response structure)
* [ ] Document endpoints (e.g. OpenAPI/Swagger)
* [ ] Ensure consistent error handling
* [ ] Validate input (DTO validation)

---

## Testing Strategy (Test Pyramid)

* [ ] Unit tests (business logic)
* [ ] Integration tests (database + API)
* [ ] E2E tests (user flows via UI)
  > **TODO:** Placeholder test exists in `tests/e2e/placeholder.spec.ts` to
  > keep CI green. Replace with real Playwright user-flow tests once the
  > application is running.
* [ ] Security tests (protected endpoints → 401/403 cases)
* [ ] Architecture tests (ArchUnit rules)

---

## Quality & CI/CD

* [ ] Enforce ≥80% test coverage (JaCoCo + SonarQube)
* [ ] Enable SonarQube Quality Gate (fail pipeline on issues)
* [ ] Fix all critical/high SonarQube issues
* [ ] Ensure all PRs pass CI before merge

---

## Architecture & Documentation

* [ ] Create arc42 documentation
* [ ] Create C4 diagrams (Context, Container, Component)
* [ ] Document architectural decisions (ADRs)
* [ ] Document test concept and CI pipeline

---

## Deployment & Runability

* [ ] Provide reproducible setup (max. 2 commands)

    * e.g. Docker Compose or startup script
* [ ] Ensure project runs locally without manual setup
* [ ] Prepare demo scenario

---

## Open Questions

* [ ] Is PokeAPI sufficient as external service?
* [ ] When should external API calls be triggered?
* [ ] How is Pokémon progression mapped to user tasks?
* [ ] What authentication strategy is used (JWT, session, etc.)?

---

## Current Mode

The project is currently in **bootstrap phase**:

* CI/CD and tooling are set up with relaxed constraints
* Quality gates (coverage ≥80%, strict SonarQube checks) will be enforced in a later phase
