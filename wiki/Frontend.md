# Frontend

Das Frontend ist eine Angular-App mit Standalone Components, SCSS-Tokens,
zentralem App-State und gekapselter Backend-Anbindung.

## Lokaler Start

Im Repo-Root:

```powershell
.\scripts\dev.ps1
```

Manuell:

```powershell
docker compose up -d db
cd frontend
npm install
npm start
```

Frontend lokal:

```text
http://localhost:4200
```

## Proxy

Der Angular-Proxy in `frontend/proxy.conf.json` leitet lokale Requests weiter:

```text
/api    -> http://localhost:8181
/assets -> http://localhost:8181
```

## App-Flow

1. Splash-Screen oeffnen.
2. Einloggen oder registrieren.
3. Tagesquests laden.
4. Quest erledigen.
5. Wasserstand speichern.
6. Pokemon trainieren.
7. Wetter-Szene über Stadt und Open-Meteo aktualisieren.
8. Logout.

## Checks

Im Ordner `frontend/`:

```powershell
npm run type-check
npm test
npm run lint
npm run test:e2e
```

Ausführliche Frontend-Doku: `frontend/README.md`.
