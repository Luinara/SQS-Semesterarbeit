# Frontend Component Architecture

This document describes the frontend component architecture of the Self-Care
Companion. It complements the arc42 building block view with a more detailed
look at the Angular components, their responsibilities, and the architectural
patterns used in the current frontend.

## Purpose

The frontend is responsible for the complete user interaction of the current
MVP. It renders the splash screen, authentication flow, dashboard, task
overview, and pet progress view. Because the backend API is not implemented yet,
the frontend currently uses a local demo state stored in the browser.

The design goal is to keep UI components simple and predictable. Components
render data, emit user intentions, and delegate application rules to a central
state service and pure logic functions.

## Main Pattern

The frontend follows a component-oriented Angular architecture with clear
separation between page composition, reusable UI, state orchestration, and
domain logic.

| Pattern | Implementation in this project | Benefit |
| --- | --- | --- |
| Standalone Components | Components declare their own imports and do not depend on Angular modules. | Each component is easier to understand, reuse, and lazy-load. |
| Page Components | `SplashPageComponent`, `AuthPageComponent`, and `DashboardPageComponent` represent routed screens. | Routing stays close to high-level user journeys. |
| Smart Page, Dumb Child Components | Pages inject services and pass data to child components through inputs. Child components emit events through outputs. | Business actions stay centralized while presentation components remain reusable. |
| Central State Service | `AppStateService` exposes signals and methods for authentication, tasks, pet progress, and reset behavior. | Components use one stable frontend API instead of duplicating state rules. |
| Pure State Logic | `app-state.logic.ts` contains framework-independent functions for state transitions. | Rules are easier to test and can later be reused when the backend integration changes. |
| Shared UI Components | Button, progress bar, and stat badge are placed under `shared/ui`. | Repeated visual elements stay consistent across pages. |
| Route Guards | `authGuard` and `guestGuard` protect dashboard and authentication routes. | Access rules are enforced at routing level instead of inside individual pages. |

## Design Pattern Analysis

The frontend does not apply a single large architectural pattern in a strict
textbook form. Instead, it combines several smaller patterns that fit the size
and maturity of the MVP.

| Pattern or concept | Applied? | Analysis |
| --- | --- | --- |
| Component-Based Architecture | Yes | Angular components are the main building blocks. Pages, feature components, and shared UI components are separated by responsibility. |
| Smart and Presentational Components | Partly | Page components such as `DashboardPageComponent` know the state service and handle user actions. Child components such as `TaskCardComponent` and `PetCardComponent` mainly receive inputs and emit outputs. This pattern is applied pragmatically, not as a strict rule for every component. |
| Facade Pattern | Yes | `AppStateService` acts as a frontend facade. Components use one service API instead of directly accessing storage, mock data, or state transition functions. |
| Repository Pattern | No | There is no dedicated repository abstraction in the frontend. `BrowserStorageService` wraps `localStorage`, but it is a technical storage adapter, not a domain repository. |
| Observer / Reactive State Pattern | Yes | Angular signals, computed signals, and effects are used to react to state changes and update templates automatically. |
| Dependency Injection | Yes | Angular dependency injection is used for services such as `AppStateService`, `BrowserStorageService`, `Router`, and form builders. |
| Guard Pattern | Yes | Route guards centralize access decisions for guest-only and authenticated-only routes. |
| Strategy Pattern | No | There are no interchangeable algorithms selected at runtime. Pet and task rules are implemented as direct pure functions. |
| Domain-Driven Design | Not fully | The frontend has domain concepts such as users, tasks, pet state, and game state. However, it does not implement full DDD tactical patterns such as aggregates, repositories, domain services, bounded contexts, or value objects. For this MVP, the domain is intentionally lightweight. |

If "DDGL" refers to Domain-Driven Design or a similar domain-driven layering
approach, then it was not applied as a complete architecture style. The project
uses domain-inspired names and typed models, but the frontend remains a compact
Angular MVP with a service facade and pure state functions.

## Component Structure

```text
frontend/src/app
|-- app.routes.ts
|-- core
|   |-- guards
|   |-- services
|   `-- state
|-- pages
|   |-- auth
|   |-- dashboard
|   `-- splash
`-- shared
    |-- mock
    |-- models
    `-- ui
```

## Responsibilities

| Area | Responsibility |
| --- | --- |
| `app.routes.ts` | Defines route paths, lazy-loaded page components, redirects, and guard usage. |
| `core/guards` | Decides whether a user may enter guest-only or authenticated-only routes. |
| `core/services/AppStateService` | Provides the frontend API for reading state and performing user actions. |
| `core/services/BrowserStorageService` | Encapsulates access to `localStorage` and JSON parsing. |
| `core/state/app-state.logic.ts` | Implements pure state transitions for registration, login, tasks, pet feeding, and reset. |
| `pages/auth` | Handles login and registration UI, form validation, and authentication mode switching. |
| `pages/dashboard` | Composes the authenticated dashboard and connects user actions to `AppStateService`. |
| `pages/dashboard/components` | Displays dashboard-specific parts such as tasks, pet status, pet visual, and top bar. |
| `shared/ui` | Contains reusable, presentation-only UI elements. |
| `shared/models` | Defines TypeScript interfaces for users, auth data, tasks, pet state, and app state. |
| `shared/mock` | Provides demo accounts, initial task data, pet rules, and local MVP setup data. |

## Data Flow

The frontend uses a unidirectional data flow:

```text
User interaction
    -> Component output or page method
    -> AppStateService method
    -> Pure state logic
    -> Angular signal update
    -> BrowserStorageService persistence
    -> Template re-render through signals
```

Components should not write directly to `localStorage` and should not duplicate
task, login, or pet rules. They call `AppStateService` methods instead.

## State Management

`AppStateService` keeps the current application snapshot in an Angular signal.
Derived values such as `isAuthenticated`, `user`, `pet`, `tasks`,
`totalTaskCount`, and `completedTaskCount` are exposed as computed signals.

State-changing operations are intentionally small:

| Operation | Responsibility |
| --- | --- |
| `login` | Finds a matching local demo account and activates it. |
| `register` | Creates a local demo account and activates it immediately. |
| `logout` | Removes the active user reference while keeping local accounts. |
| `completeTask` | Marks a task as completed and updates pet-related reward values. |
| `feedPet` | Applies feeding costs, growth progress, level changes, and happiness changes. |
| `resetCurrentProgress` | Resets tasks and pet progress for the active account. |

Persistence is handled by an Angular `effect` inside `AppStateService`. Whenever
the signal snapshot changes, the new snapshot is written through
`BrowserStorageService` to the storage key `sqs.frontend.mvp.state`.

## Routing and Access Control

The frontend defines three main routes:

| Route | Component | Access rule |
| --- | --- | --- |
| `/splash` | `SplashPageComponent` | Public entry route. |
| `/auth` | `AuthPageComponent` | Guest-only route controlled by `guestGuard`. |
| `/dashboard` | `DashboardPageComponent` | Authenticated-only route controlled by `authGuard`. |

Unknown routes redirect to `/splash`.

## Component Communication

Dashboard child components communicate with their parent through Angular inputs
and outputs:

| Component | Inputs | Outputs |
| --- | --- | --- |
| `TaskListComponent` | Task list and available food points. | Emits the ID of a completed task. |
| `TaskCardComponent` | One task item. | Emits a completion request for that task. |
| `PetCardComponent` | Pet state and task progress values. | Emits a feeding request. |
| `AuthFormComponent` | Authentication mode and feedback state. | Emits login or registration data. |

This keeps child components independent from the global state service. The page
component decides how emitted user intentions are handled.

## Current Boundaries

The current frontend uses mock data and browser storage as an MVP substitute for
the planned backend. This is a deliberate temporary boundary:

| Current frontend behavior | Later backend-backed behavior |
| --- | --- |
| Local accounts are stored in `localStorage`. | Accounts should be managed by backend authentication. |
| Task and pet rules run in frontend pure functions. | Rules can move to backend services or be shared through API contracts. |
| Demo data is created from `shared/mock`. | Initial data should come from backend endpoints. |
| Guards check local authentication state. | Guards should check a real authenticated session or token state. |

The existing separation makes this migration easier: pages and visual
components already depend on `AppStateService`, not on storage details or mock
data directly.

## Design Rules for Future Components

New frontend components should follow these rules:

| Rule | Reason |
| --- | --- |
| Put routed screens under `pages`. | Pages represent complete user journeys and own service interaction. |
| Put reusable visual components under `shared/ui`. | Shared UI should stay presentation-focused and domain-neutral. |
| Keep feature-specific components close to their page. | Dashboard-only components should remain under `pages/dashboard/components`. |
| Use inputs and outputs for child components. | Child components stay reusable and do not need to know global state. |
| Put state-changing business rules in `core/state` or a service. | Rules stay testable and are not spread across templates. |
| Keep models in `shared/models`. | Data contracts stay discoverable and consistent. |
