# C4 Diagramm - PokeHabit

Dieses Dokument beschreibt die Architektur der PokeHabit-Webanwendung im
C4-Stil. Es geht um den aktuellen Stand der Abgabe: Angular-Frontend,
Spring-Boot-Backend, PostgreSQL, PokeAPI-Anbindung im Backend, Open-Meteo im
Frontend und der lokale Quality Hub.

## Quellen

| Datei | Zweck |
| --- | --- |
| [structurizr/workspace.dsl](./structurizr/workspace.dsl) | Bearbeitbare Structurizr-DSL für System Context, Container und Backend-Komponenten. |
| [c4-diagram.svg](./c4-diagram.svg) | Kompakte gerenderte Übersicht für Markdown-Preview und Präsentation. |
| [mermaid/](./mermaid/) | Zusätzliche Mermaid-Quellen und SVGs, falls keine Structurizr-Umgebung verfügbar ist. |

## Level 1: System Context

![C4 Level 1 System Context](./mermaid/c4-level-1-system-context.svg)

Mermaid-Quelle: [c4-level-1-system-context.mmd](./mermaid/c4-level-1-system-context.mmd)

| Element | Typ | Verantwortung |
| --- | --- | --- |
| Nutzer | Person | Registriert sich, meldet sich an, erledigt Quests, trinkt Wasser und trainiert den Pokemon-Partner. |
| PokeHabit | Softwaresystem | Stellt UI, Authentifizierung, Aufgabenverwaltung, Fortschritt und Gamification bereit. |
| PokeAPI | Externes System | Liefert Pokemon-Namen und offizielles Artwork für Starter-Pokemon. |
| Open-Meteo | Externes System | Liefert Wetterdaten für die Dashboard-Szene. |

## Level 2: Container

![C4 Level 2 Container](./mermaid/c4-level-2-container.svg)

Mermaid-Quelle: [c4-level-2-container.mmd](./mermaid/c4-level-2-container.mmd)

| Container | Technologie | Verantwortung |
| --- | --- | --- |
| Frontend | Angular, TypeScript, SCSS | Zeigt Splash, Login, Registrierung und Dashboard; ruft Backend-Endpunkte mit Session-Cookie auf. |
| Backend API | Java 21, Spring Boot, Spring Data JPA | Kapselt Auth, User-State, Tasks, Pokemon-Progression und PokeAPI-Zugriff. |
| PostgreSQL | PostgreSQL | Persistiert Nutzer, Tasks, Starter-Pokemon, Wasserstand, XP, Level und Streak. |
| Quality Hub | Nginx, statische HTML-App | Zeigt lokale Quality-Gate-Ergebnisse aus dem Docker-Volume. |
| PokeAPI | Externer REST-Service | Liefert Starter-Pokemon-Daten für das Backend. |
| Open-Meteo | Externer REST-Service | Liefert Wetterdaten für das Frontend. |

## Level 3: Backend Components

![C4 Level 3 Backend Components](./mermaid/c4-level-3-backend-components.svg)

Mermaid-Quelle: [c4-level-3-backend-components.mmd](./mermaid/c4-level-3-backend-components.mmd)

| Komponente | Package | Verantwortung |
| --- | --- | --- |
| AuthenticationController | `io.github.luinara.sqs.authentication` | Registrierung, Login und Logout. |
| UserController | `io.github.luinara.sqs.user` | Game-State, Wasser, Training und Account-Löschung. |
| TaskController | `io.github.luinara.sqs.task` | Öffentliche Task-Liste und geschützter Task-Abschluss. |
| AuthenticationService | `io.github.luinara.sqs.authentication` | Passwort-Hashing, Login-Schutz, Starter-Auswahl und Session-Logik. |
| UserService | `io.github.luinara.sqs.user` | Pokemon-Level, XP, Evolution, Wasserstand und DTO-Mapping. |
| TaskService | `io.github.luinara.sqs.task` | Task-Auswahl, Tageslogik und Fortschrittsänderungen. |
| PokeApiPokemonService | `io.github.luinara.sqs.pokemon` | Externer PokeAPI-Aufruf mit Timeout und lokalem Fallback. |
| Repositories | `io.github.luinara.sqs.*` | Persistenz über Spring Data JPA. |

## Frontend Component View

![C4 Frontend Components](./mermaid/c4-frontend-components.svg)

Mermaid-Quelle: [c4-frontend-components.mmd](./mermaid/c4-frontend-components.mmd)

| Komponente | Verantwortung |
| --- | --- |
| Routing und Guards | Trennen Gast-, Auth- und Dashboard-Routen. |
| Pages | Bilden Splash, Auth und Dashboard als Hauptansichten. |
| Dashboard Components | Zeigen Tasks, Wetter, Pokemon-Fokus, Wasserstand und Feedback. |
| Shared UI | Wiederverwendbare UI-Bausteine. |
| Core State & Services | Bündeln API-Zugriffe, Session-Restore und App-State. |
| Models | Typisieren Requests, Responses und UI-Zustand. |

## Deployment View

![C4 Deployment](./mermaid/c4-deployment.svg)

Mermaid-Quelle: [c4-deployment.mmd](./mermaid/c4-deployment.mmd)

| Node | Beschreibung |
| --- | --- |
| Entwicklerrechner / Docker Host | Lokale Ausführungsumgebung für Entwicklung, Demo und Quality Hub. |
| Frontend Container | Liefert die Angular-Anwendung aus. |
| Backend Container | Führt die Spring-Boot-Anwendung aus. |
| PostgreSQL Container | Speichert persistente Daten im Docker-Volume `db_data`. |
| Quality Hub Container | Zeigt `quality-output/report.json`, Logs und Reports auf Port `8088`. |
| PokeAPI / Open-Meteo | Externe Dienste, nicht Teil des eigenen Docker-Deployments. |

## Entscheidungen

| Entscheidung | Quelle |
| --- | --- |
| Backend mit Spring Boot | [ADR-001](../adr/ADR-001-use-spring-boot.md) |
| Frontend mit Angular/TypeScript | [ADR-002](../adr/ADR-002-use-angular-typescript.md) |
| Persistenz mit PostgreSQL | [ADR-003](../adr/ADR-003-use-postgresql.md) |
| PokeAPI als externer Backend-Service | [ADR-004](../adr/ADR-004-use-pokeapi.md) |
| Feature-Packages im Backend | [ADR-005](../adr/ADR-005-use-feature-specific-folder-structure.md) |
