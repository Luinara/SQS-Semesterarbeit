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
# Backend unit tests  (**/*Test.java  via Maven Surefire)
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


## Tasks

- CI/CD:
- Figma Frontend design:
  - Startseite (öffentlicher endpunkt)
  - Login/ Sign up seite
  - Pokemon task liste
- Datenbank Design:
  - ex design user, tasks mit haken?, -> was für pokemon/entwicklung
- Frontent API:
  - wann schickt die API was für requests mit welcher erwarteten Antwort
- Implementierung mit halbem TTD

Fragen an den Prof

- Externer Dienst PokeAPI genug? Wann muss aufgerufen werden?
