# Deployment-Sicht

## Lokales Docker-Deployment

Für die Abgabe ist Docker Compose der wichtigste Startweg. Damit müssen Backend,
Frontend und Datenbank nicht einzeln eingerichtet werden.

| Service | Image source | Port | Aufgabe |
| --- | --- | --- | --- |
| `db` | `postgres:16-alpine` | `${DB_PORT:-5433}:5432` | PostgreSQL-Datenbank. |
| `backend` | `backend/Dockerfile` | `${BACKEND_PORT:-8181}:8181` | Spring-Boot-API im Dev-Profil. |
| `frontend` | `frontend/Dockerfile` | `${FRONTEND_PORT:-3000}:3000` | Angular-Build über Nginx, inklusive Proxy für `/api` und `/assets`. |
| `quality-hub` | `quality/Dockerfile.hub` | `${QUALITY_HUB_PORT:-8088}:80` | Dashboard für die lokalen Prüfergebnisse. |
| `quality-runner` | `quality/Dockerfile.runner` | none | Einmaliger Container, der die Checks ausführt. |

Normaler App-Start:

```bash
docker compose up --build
```

App plus Quality Hub:

```bash
docker compose --profile quality up --build
```

Die Host-Ports können über Umgebungsvariablen geändert werden. So muss die
Compose-Datei nicht angepasst werden, wenn lokal ein Port belegt ist.

## Volumes

| Volume | Use |
| --- | --- |
| `db_data` | Persistente PostgreSQL-Daten. |
| `quality_output` | Quality-Report, Logs, Coverage-Reports und Playwright-Nachweise. |
