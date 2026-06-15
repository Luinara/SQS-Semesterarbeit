# PokeHabit

PokeHabit ist unsere gamifizierte Self-Care-App für die SQS-Semesterarbeit. Der
Stack besteht aus Angular-Frontend, Spring-Boot-Backend und PostgreSQL.

## One-Click-Start

App und Datenbank:

```bash
docker compose up --build
```

Mit Software-Qualitätssicherungs-Dashboard:

```bash
docker compose --profile quality up --build
```

Danach sind erreichbar:

- App: `http://localhost:3000`
- Backend: `http://localhost:8181`
- Quality Hub: `http://localhost:8088`

Die Ports sind Defaults und können bei lokalen Konflikten überschrieben werden, zum Beispiel:
`FRONTEND_PORT=3001 docker compose --profile quality up --build`.

## Quality Hub

Der Quality Hub ist unser lokales SQS-Dashboard. Er zeigt echte Ergebnisse aus
dem Runner, nicht nur eine manuell gepflegte Checkliste:

- Backend-Tests mit JaCoCo
- Checkstyle und SpotBugs
- Frontend-Typecheck, Unit-Tests, Coverage und ESLint
- npm-Security-Check
- optionaler Playwright-E2E-Flow gegen den Docker-App-Stack

Der Runner schreibt `report.json`, Logs und HTML-Reports in ein Docker-Volume.
Der Hub liest diese Daten und aktualisiert die Ansicht automatisch.

## Dokumentation

Die technische Dokumentation liegt unter `docs/` und ist für ReadTheDocs
vorbereitet. Wichtige Einstiegspunkte:

- `docs/index.md`
- `docs/test-pyramid.md`
- `docs/arc42/`
- `docs/adr/`
- `docs/diagrams/c4-diagram.md`
- `docs/diagrams/structurizr/workspace.dsl`
- `docs/presentation-plan.md`
- `docs/presentation-cheat-sheet.md`

ReadTheDocs nutzt `.readthedocs.yaml`, `mkdocs.yml` und
`docs/requirements.txt`. Nach dem Verbinden des öffentlichen Repositorys kann
die Doku dort direkt gebaut werden.
