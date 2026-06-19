# PokeHabit Dokumentation

PokeHabit ist die SQS-Semesterarbeit als Web-App mit Angular-Frontend,
Spring-Boot-Backend, PostgreSQL und lokalem Quality Hub. Diese Dokumentation ist
kapitelweise geordnet, damit Abgabe, Review und Präsentation schnell prüfbar
bleiben.

## Inhaltsverzeichnis

| Kapitel                                                 | Inhalt                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| [02 Architektur](02-architecture/arc42/README.md)       | arc42, C4-Diagramme, englische ADRs und deutsche ADR-Kopien         |
| [03 API](03-api/auth.md)                                | Authentifizierung, Tasks, User Actions, Game State und API-Handover |
| [04 Qualität](04-quality/test-pyramid.md)               | Testpyramide, Quality Hub, Coverage und Frontend-npm-Security       |
| [05 Präsentation](05-presentation/presentation-plan.md) | Ablaufplan und Sprechzettel für die Demo                            |
| [06 Betrieb](06-operations/readthedocs-publish.md)      | ReadTheDocs-Veröffentlichung und operative Hinweise                 |

## Schnellstart
todo
App und Datenbank:

```bash
docker compose up --build
```

App, Datenbank und Quality Hub:

```bash
docker compose --profile quality up --build
```

Standard-URLs:

| Dienst      | URL                     |
| ----------- | ----------------------- |
| Frontend    | `http://localhost:3000` |
| Backend     | `http://localhost:8181` |
| Quality Hub | `http://localhost:8088` |

## Wichtige Nachweise

| Bereich                   | Dokumentation                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| API-Verträge              | `03-api/`                                                                                                |
| Architektur               | `02-architecture/arc42/`                                                                                 |
| Architekturentscheidungen | `adr/` und `ger-adr/`                                                                                    |
| C4-Modell                 | `02-architecture/diagrams/c4-diagram.md` und `02-architecture/diagrams/structurizr/workspace.dsl`        |
| Qualitätssicherung        | `04-quality/`, Quality Hub, JaCoCo, Vitest Coverage, Checkstyle, SpotBugs, ESLint, npm Audit, Playwright |
| Präsentation              | `05-presentation/`                                                                                       |

## Abgabe-relevante Punkte

- Öffentlicher Endpunkt: `GET /api/tasks`.
- Geschützte Endpunkte: User-Game-State, Wassertracking, Logout und Account-Löschung.
- Drei Schichten: Frontend, Backend, Persistenz.
- Externe API: Open-Meteo über `WeatherService` und `BackendWeatherAdapter`
  für Geocoding, aktuelle Wetterdaten und die Dashboard-Wetter-Szene.
- Testpyramide: Unit-, Integrations-, Architektur-, Security- und E2E-Tests.
- Docker-Start mit maximal zwei Befehlen; für die Demo reicht der Quality-Profile-Start.

## ReadTheDocs

Das Repository enthält die ReadTheDocs-Konfiguration:

- `.readthedocs.yaml`
- `mkdocs.yml`
- `docs/requirements.txt`

Nach dem Verbinden des öffentlichen Repositorys mit ReadTheDocs kann die
Dokumentation direkt aus dem `docs/`-Ordner gebaut werden.
Die konkreten Schritte stehen in [ReadTheDocs veröffentlichen](06-operations/readthedocs-publish.md).
