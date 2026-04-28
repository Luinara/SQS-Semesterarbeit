# C4 Diagramm - Self-Care Companion

Dieses Dokument beschreibt die Architektur der Self-Care Companion Webanwendung im C4-Stil. Die Diagramme bilden den aktuellen Projektstand und die geplante Zielarchitektur ab: ein Angular-Frontend, ein Spring-Boot-Backend, PostgreSQL als Datenbank und die externe PokeAPI fuer Pokemon-Daten.

## Visuelle Uebersicht

![C4 Diagramm - Self-Care Companion](./c4-diagram.svg)

## Level 1: System Context

```mermaid
flowchart LR
    USER["Person: Nutzer der Self-Care App"]
    SCS["Self-Care Companion: Aufgaben, Fortschritt und pet-basierte Gamification"]
    POKEAPI["PokeAPI: Externer REST-Service fuer Pokemon-Daten"]

    USER -->|nutzt im Browser| SCS
    SCS -->|liest Pokemon-Daten per HTTPS| POKEAPI
```

### Beschreibung

| Element | Typ | Verantwortung |
| --- | --- | --- |
| Nutzer | Person | Registriert sich, meldet sich an, verwaltet Aufgaben und sieht den Fortschritt des virtuellen Begleiters. |
| Self-Care Companion | Softwaresystem | Stellt UI, Authentifizierung, Aufgabenverwaltung, Fortschrittslogik und Pokemon-Gamification bereit. |
| PokeAPI | Externes System | Liefert Pokemon-Daten wie Namen, Bilder und Eigenschaften. |

## Level 2: Container

```mermaid
flowchart LR
    USER["Person: Nutzer"]

    subgraph APP["Self-Care Companion"]
        FE["Frontend: Angular / TypeScript SPA"]
        BE["Backend API: Java 21 / Spring Boot"]
        DB[(Datenbank: PostgreSQL)]
    end

    POKEAPI["PokeAPI: Externe REST API"]

    USER -->|HTTPS / Browser| FE
    FE -->|REST JSON /api| BE
    BE -->|JDBC / JPA| DB
    BE -->|HTTPS / JSON| POKEAPI
```

### Container-Verantwortlichkeiten

| Container | Technologie | Verantwortung |
| --- | --- | --- |
| Frontend | Angular, TypeScript, SCSS | Zeigt Splash-, Login- und Dashboard-Seiten, verwaltet UI-Zustand und ruft Backend-Endpunkte auf. |
| Backend API | Java 21, Spring Boot 3, Spring Web, Spring Data JPA | Kapselt REST-Endpunkte, Authentifizierung, Aufgabenlogik, Fortschrittsberechnung und externe Integrationen. |
| Datenbank | PostgreSQL | Persistiert Nutzer, Aufgaben, Aufgabenstatus und pet-bezogene Fortschrittsdaten. |
| PokeAPI | Externer REST-Service | Liefert Pokemon-Daten fuer die Gamification. |

## Level 3: Backend Component View

```mermaid
flowchart TB
    FE["Angular Frontend"]

    subgraph BACKEND["Spring Boot Backend"]
        CTRL["Controller: REST-Endpunkte"]
        SEC["Config / Security: Auth, Autorisierung, CORS"]
        SVC["Service: Businesslogik"]
        DOM["Domain: User, Task, Pet/Pokemon"]
        REPO["Repository: Spring Data JPA"]
        INT["Integration: PokeAPI Client"]
    end

    DB[(PostgreSQL)]
    POKEAPI["PokeAPI"]

    FE -->|REST JSON| CTRL
    CTRL --> SEC
    CTRL --> SVC
    SVC --> DOM
    SVC --> REPO
    SVC --> INT
    REPO -->|JPA JDBC| DB
    INT -->|HTTPS JSON| POKEAPI
```

### Backend-Komponenten

| Komponente | Package | Verantwortung |
| --- | --- | --- |
| Controller | `com.example.app.controller` | Definiert public und protected REST-Endpunkte fuer Authentifizierung, Dashboard und Aufgaben. |
| Config / Security | `com.example.app.config` | Konfiguriert Spring, Security-Regeln, CORS und spaetere Authentifizierungsmechanismen. |
| Service | `com.example.app.service` | Enthaelt die fachliche Logik, z. B. Aufgaben abschliessen, Fortschritt berechnen und Pokemon-Daten anreichern. |
| Domain | `com.example.app.domain` | Modelliert zentrale Fachobjekte wie Nutzer, Aufgaben, Status und Pet/Pokemon-Fortschritt. |
| Repository | `com.example.app.repository` | Kapselt Datenzugriff ueber Spring Data JPA. |
| Integration | `com.example.app.integration` | Kapselt Kommunikation mit externen Diensten, insbesondere PokeAPI. |

## Frontend Component View

```mermaid
flowchart TB
    BROWSER["Browser"]

    subgraph FRONTEND["Angular Frontend"]
        ROUTES["Routing: Splash, Auth, Dashboard"]
        GUARDS["Guards: authGuard, guestGuard"]
        PAGES["Pages: SplashPage, AuthPage, DashboardPage"]
        DASH["Dashboard Components: TopBar, TaskList, TaskCard, PetCard, PetVisual"]
        UI["Shared UI: Button, ProgressBar, StatBadge"]
        STATE["Core State & Services: AppStateService, BrowserStorageService"]
        MODELS["Models: User, Auth, Task, Pet, AppState"]
    end

    API["Backend API"]

    BROWSER --> ROUTES
    ROUTES --> GUARDS
    ROUTES --> PAGES
    PAGES --> DASH
    PAGES --> UI
    PAGES --> STATE
    STATE --> MODELS
    STATE -.-> API
```

### Frontend-Komponenten

| Komponente | Verantwortung |
| --- | --- |
| Routing | Definiert Navigation zwischen Splash, Auth und Dashboard. |
| Guards | Schuetzen Routen fuer angemeldete bzw. nicht angemeldete Nutzer. |
| Pages | Bilden die groben fachlichen Ansichten der Anwendung. |
| Dashboard Components | Stellen Aufgabenliste, einzelne Aufgaben, Fortschritt und Pet-Darstellung dar. |
| Shared UI | Wiederverwendbare UI-Bausteine fuer Buttons, Fortschrittsbalken und Statusanzeigen. |
| Core State & Services | Verwaltet App-Zustand und lokale Browser-Speicherung. |
| Models | Typisiert Datenstrukturen fuer Nutzer, Authentifizierung, Aufgaben und Pet-Zustand. |

## Deployment View

```mermaid
flowchart LR
    DEV["Entwicklerrechner / Docker Host"]

    subgraph COMPOSE["Docker Compose Umgebung"]
        FE["Frontend Container: Port 3000"]
        BE["Backend Container: Port 8080"]
        PG[(PostgreSQL Container: Port 5432, Volume db_data)]
    end

    POKEAPI["PokeAPI: Internet"]

    DEV -->|localhost 3000| FE
    FE -->|backend 8080 REST| BE
    BE -->|jdbc postgresql db 5432 sqs_db| PG
    BE -->|HTTPS| POKEAPI
```

### Deployment-Hinweise

| Node | Beschreibung |
| --- | --- |
| Entwicklerrechner / Docker Host | Lokale Ausfuehrungsumgebung fuer Entwicklung und Demo. |
| Frontend Container | Liefert die Angular-Anwendung aus und kommuniziert mit dem Backend. |
| Backend Container | Fuehrt die Spring-Boot-Anwendung aus. |
| PostgreSQL Container | Speichert persistente Daten im Docker-Volume `db_data`. |
| PokeAPI | Externer Internetdienst, der nicht Teil des eigenen Deployments ist. |

## Architekturentscheidungen

| Entscheidung | Quelle / Bezug |
| --- | --- |
| Backend mit Spring Boot | `docs/adr/ADR-001-use-spring-boot.md` |
| Persistenz mit PostgreSQL | `docs/adr/ADR-003-use-postgresql.md` |
| Pokemon-Daten ueber PokeAPI | `docs/adr/ADR-004-use-pokeapi.md` |
| Frontend aktuell mit Angular | Abgeleitet aus `frontend/package.json` und `frontend/src/app/` |

## Abgrenzung

Das Backend enthaelt aktuell erst die Paketstruktur fuer Controller, Services, Domain, Repository und Integration. Die C4-Komponentensicht beschreibt daher die vorgesehene Architektur, die bereits durch Projektstruktur, README, ADRs und Testkonzept vorbereitet ist. Die konkrete Implementierung der REST-Endpunkte, Security-Regeln, Persistenzmodelle und PokeAPI-Integration ist noch auszubauen.
