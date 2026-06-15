# PokeHabit

PokeHabit ist eine gamifizierte Self-Care-App für die SQS-Semesterarbeit. Der Stack besteht aus
Angular-Frontend, Spring-Boot-Backend und PostgreSQL.

## One-Click-Start

App und Datenbank:

```bash
docker compose up --build
```

Mit Software-Qualitätssicherungs-Dashboard:

```bash
docker compose --profile quality up --build
```

Danach sind die wichtigsten Oberflächen erreichbar:

- App: `http://localhost:3000`
- Backend: `http://localhost:8181`
- Quality Hub: `http://localhost:8088`

Die Ports sind Defaults und können bei lokalen Konflikten überschrieben werden, zum Beispiel
`FRONTEND_PORT=3001 docker compose --profile quality up --build`.

## Quality Hub

Der Quality Hub ist ein dockerisiertes SQS-Cockpit. Er zeigt nicht nur eine Checkliste, sondern echte
Ergebnisse aus dem Runner:

- Backend-Tests mit JaCoCo
- Checkstyle und SpotBugs
- Frontend-Typecheck, Unit-Tests, Coverage und ESLint
- npm-Security-Check
- optionaler Playwright-E2E-Flow gegen den Docker-App-Stack

Der Runner schreibt `report.json`, Logs und HTML-Reports in ein Docker-Volume. Der Hub liest diese
Daten live und aktualisiert die Ansicht automatisch.
