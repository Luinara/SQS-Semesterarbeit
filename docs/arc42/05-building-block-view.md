# Building Block View

This section describes the static decomposition of the Self-Care Companion.
The system is split into a browser-based Angular frontend, a Spring Boot
backend, a PostgreSQL database, external weather/Pokemon integrations, and a
dockerized Quality Hub.

The Angular component structure is documented in detail in
[Frontend Component Architecture](frontend-component-architecture.md).
That additional view also contains a design pattern analysis and clarifies that
Domain-Driven Design is only used in a lightweight, domain-inspired way, not as
a complete DDD architecture.

## Level 1 - System Overview

| Building block | Responsibility |
| --- | --- |
| Angular Frontend | Provides the user interface for splash, authentication, dashboard, tasks, hydration, pet progress, starter evolution, and weather scene. |
| Backend API | REST API for authentication, tasks, user game state, hydration, feed/training, account deletion, and persistence access. |
| PostgreSQL Database | Persistent storage for users, tasks, task state, user stats, and pet progress. |
| PokeAPI | External API used to enrich the gamification part with Pokemon-related data. |
| Open-Meteo | External API used by the frontend weather adapter. |
| Quality Hub | Dockerisiertes Dashboard mit Runner für Tests, Coverage, Lint, statische Analyse, Security und E2E-Reports. |

## Level 2 - Frontend Overview

| Building block | Responsibility |
| --- | --- |
| Routes and Guards | Define navigation and protect guest-only or authenticated-only pages. |
| Pages | Compose full application views such as Splash, Auth, and Dashboard. |
| Feature Components | Implement dashboard-specific UI such as task list, task cards, pet card, pet visual, and top bar. |
| Shared UI Components | Provide reusable presentation elements such as buttons, progress bars, and statistic badges. |
| Core State and Services | Centralize application state, local persistence, and business operations exposed to components. |
| Pure State Logic | Contains framework-independent rules for login, registration, task completion, pet feeding, and reset behavior. |
| Shared Models and Mock Data | Define TypeScript contracts and demo data used by the frontend MVP. |
