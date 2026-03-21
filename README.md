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
│       │   │   ├── client/           # External API / service clients
│       │   │   ├── config/           # Spring configuration classes
│       │   │   ├── controller/       # REST controllers
│       │   │   ├── model/            # Domain / entity models
│       │   │   ├── repository/       # Spring Data repositories (database)
│       │   │   └── service/          # Business logic / service layer
│       │   └── resources/
│       │       ├── application.properties      # Base configuration
│       │       └── application-dev.properties  # Development overrides
│       └── test/
│           ├── java/com/example/app/
│           │   ├── integration/      # Integration tests (*IT.java)
│           │   └── unit/             # Unit tests (*Test.java)
│           └── resources/
│               └── application-test.properties
│
├── frontend/                         # TypeScript / React frontend
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── config/                   # Frontend configuration & constants
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── pages/                    # Route-level page components
│   │   ├── services/                 # API client / data-fetching layer
│   │   ├── types/                    # Shared TypeScript type definitions
│   │   └── utils/                    # Pure utility / helper functions
│   ├── tests/
│   │   ├── e2e/                      # Playwright end-to-end tests
│   │   ├── integration/              # Component integration tests
│   │   └── unit/                     # Vitest unit tests
│   ├── public/                       # Static assets
│   ├── .env.example                  # Environment variable template
│   ├── package.json
│   ├── playwright.config.ts          # Playwright (e2e) configuration
│   ├── tsconfig.json
│   └── vite.config.ts                # Vite / Vitest configuration
│
└── tests/                            # Cross-cutting / full-stack tests
    ├── e2e/                          # Full-stack browser tests
    ├── integration/                  # Backend + frontend integration tests
    ├── performance/                  # Load & performance tests (future)
    └── unit/                         # Shared test utilities (future)
```

---

## Technology Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Backend     | Java 21, Spring Boot 3, Spring Data JPA |
| Database    | PostgreSQL (H2 for tests)               |
| Frontend    | TypeScript, React 18, Vite              |
| Unit tests  | JUnit 5 / Mockito (backend), Vitest (frontend) |
| E2E tests   | Playwright                              |

---

## Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- Maven 3.9+
- PostgreSQL (or Docker)

### Backend

```bash
cd backend
cp src/main/resources/application.properties src/main/resources/application-local.properties
# Edit application-local.properties with your database credentials
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with the correct API base URL
npm install
npm run dev
```

### Running Tests

```bash
# Backend unit tests
cd backend && mvn test

# Backend integration tests
cd backend && mvn verify

# Frontend unit tests
cd frontend && npm test

# Frontend e2e tests (requires the dev server to be running)
cd frontend && npm run test:e2e
```
