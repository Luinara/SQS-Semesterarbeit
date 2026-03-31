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
│       │   │   ├── integration/      # External service communication (PokeAPI)
│       │   │   └── util/             # Helper utilities
│       │   └── resources/
│       │       ├── application.properties      # Base configuration
│       │       └── application-dev.properties  # Development overrides
│       └── test/
│           ├── java/com/example/app/
│           │   ├── unit/             # Unit tests (*Test.java)
│           │   ├── integration/      # Integration tests (*IT.java)
│           │   ├── security/         # Security / auth tests
│           │   └── architecture/     # ArchUnit architecture rules
│           └── resources/
│               └── application-test.properties
│
├── frontend/                         # TypeScript / React frontend
│   ├── src/
│   │   ├── api/                      # Backend communication layer
│   │   ├── components/               # Reusable UI elements
│   │   ├── features/                 # Domain-based modules (pokemon, tasks, user)
│   │   ├── pages/                    # Routing-level views
│   │   ├── hooks/                    # Reusable React hooks
│   │   ├── store/                    # State management
│   │   ├── types/                    # Shared TypeScript type definitions
│   │   └── utils/                    # Pure helper functions
│   ├── tests/
│   │   ├── unit/                     # Vitest unit tests
│   │   └── e2e/                      # Playwright end-to-end tests
│   ├── public/                       # Static assets
│   ├── .env.example                  # Environment variable template
│   ├── package.json
│   ├── playwright.config.ts          # Playwright (e2e) configuration
│   ├── tsconfig.json
│   └── vite.config.ts                # Vite / Vitest configuration
│
├── tests/                            # Cross-system tests
│   ├── unit/                         # Shared test utilities
│   ├── integration/                  # Full-stack integration tests
│   ├── e2e/                          # Full-stack browser tests
│   ├── security/                     # Security / auth / penetration tests
│   └── architecture/                 # System-level architecture conformance
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

```bash
# Backend unit + architecture + security tests
cd backend && mvn test

# Backend integration tests
cd backend && mvn verify

# Frontend unit tests
cd frontend && npm test

# Frontend e2e tests (dev server must be running)
cd frontend && npm run test:e2e
```

---

## Documentation

Architecture documentation lives in [`docs/`](docs/):

- [`docs/arc42/`](docs/arc42/) – arc42 architecture documentation
- [`docs/adr/`](docs/adr/) – Architecture Decision Records
- [`docs/diagrams/`](docs/diagrams/) – System and component diagrams
