# PokeHabit Wiki

PokeHabit ist die SQS-Semesterarbeit als Web-App mit Angular-Frontend,
Spring-Boot-Backend, PostgreSQL und lokalem Quality Hub.

Dieses Wiki ist der schnelle Einstieg für Review, Abgabe und Präsentation.
Die ausführliche technische Dokumentation bleibt parallel unter `docs/` und
wird über MkDocs/ReadTheDocs gebaut.

## Schnellstart

```bash
docker compose up --build
```

Mit Quality Hub:

```bash
docker compose --profile quality up --build
```

| Dienst | URL |
| --- | --- |
| App | `http://localhost:3000` |
| Backend | `http://localhost:8181` |
| Quality Hub | `http://localhost:8088` |

Demo-Login:

```text
demo / password123
```

## Einstiegspunkte

| Thema | Wiki-Seite | Ausführliche Doku |
| --- | --- | --- |
| Architektur | [Architektur](Architektur) | `docs/02-architecture/` |
| API | [API](API) | `docs/03-api/` |
| Frontend | [Frontend](Frontend) | `frontend/README.md` |
| Teststrategie | [Teststrategie](Teststrategie) | `docs/04-quality/test-pyramid.md` |
| Quality Hub | [Quality Hub](Quality-Hub) | `docs/04-quality/` |
| Abgabe | [Abgabe-Checkliste](Abgabe-Checkliste) | `docs/05-presentation/`, `docs/06-operations/` |

## Abgabe-relevante Nachweise

- Drei Schichten: Frontend, Backend und Persistenz.
- Öffentlicher Endpunkt: `GET /api/tasks`.
- Geschützte Endpunkte mit Session-Cookie.
- Externe APIs: PokeAPI im Backend, Open-Meteo im Frontend.
- Unit-, Controller-, Integrations-, Architektur-, Security- und E2E-Tests.
- Quality Hub als sichtbares SQS-Dashboard.
- arc42, ADRs und C4-Diagramme unter `docs/`.
