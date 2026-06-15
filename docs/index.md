# PokeHabit Dokumentation

PokeHabit ist die SQS-Semesterarbeit als Web-App mit Angular-Frontend,
Spring-Boot-Backend, PostgreSQL und lokalem Quality Hub. Diese Dokumentation
fasst die technischen Nachweise für Abgabe, Review und Präsentation zusammen.

## Schnellstart

App und Datenbank:

```bash
docker compose up --build
```

App, Datenbank und Quality Hub:

```bash
docker compose --profile quality up --build
```

Standard-URLs:

| Dienst | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:8181` |
| Quality Hub | `http://localhost:8088` |

## Wichtige Nachweise

| Bereich | Dokumentation |
| --- | --- |
| API-Verträge | `API_AUTH.md`, `API_TASKS.md`, `API_USER_ACTIONS.md`, `API_USER_GAME_STATE.md` |
| Architektur | `arc42/` |
| Architekturentscheidungen | `adr/` |
| C4-Modell | `diagrams/c4-diagram.md` und `diagrams/structurizr/workspace.dsl` |
| Qualitätssicherung | Quality Hub, JaCoCo, Vitest Coverage, Checkstyle, SpotBugs, ESLint, npm Audit, Playwright |
| Testpyramide | `test-pyramid.md` |
| Präsentation | `presentation-plan.md`, `presentation-cheat-sheet.md` |

## Abgabe-relevante Punkte

- Öffentlicher Endpunkt: `GET /api/tasks`.
- Geschützte Endpunkte: User-Game-State, Training, Wassertracking, Logout und Account-Löschung.
- Drei Schichten: Frontend, Backend, Persistenz.
- Externer Backend-Service: PokeAPI über `PokeApiPokemonService` mit Timeout und lokalem Fallback.
- Testpyramide: Unit-, Integrations-, Architektur-, Security- und E2E-Tests.
- Docker-Start mit maximal zwei Befehlen; für die Demo reicht der Quality-Profile-Start.

## ReadTheDocs

Das Repository enthält die ReadTheDocs-Konfiguration:

- `.readthedocs.yaml`
- `mkdocs.yml`
- `docs/requirements.txt`

Nach dem Verbinden des öffentlichen Repositorys mit ReadTheDocs kann die
Dokumentation dort direkt aus dem `docs/`-Ordner gebaut werden.
