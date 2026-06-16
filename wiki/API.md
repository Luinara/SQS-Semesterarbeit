# API

Das Backend stellt REST-Endpunkte unter `/api` bereit. Authentifizierung laeuft
ueber eine serverseitige Session mit `JSESSIONID`.

## Auth

| Methode | Pfad | Zweck |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Nutzer registrieren und Session starten |
| `POST` | `/api/auth/login` | Nutzer anmelden |
| `POST` | `/api/auth/logout` | Session beenden |

## Tasks und Spielstand

| Methode | Pfad | Zweck |
| --- | --- | --- |
| `GET` | `/api/tasks` | Oeffentliche Task-Liste laden |
| `POST` | `/api/tasks/{id}/complete` | Task abschliessen |
| `GET` | `/api/user/game-state` | Spielstand laden |
| `POST` | `/api/user/water` | Wasserstand speichern |
| `POST` | `/api/user/feed` | Pokemon trainieren |
| `DELETE` | `/api/user/account` | Account loeschen |

## Frontend-Anbindung

Das Angular-Frontend ruft die API nicht direkt aus Komponenten auf. Die
Kapselung liegt in:

- `frontend/src/app/core/services/backend-api.service.ts`
- `frontend/src/app/core/services/app-state.service.ts`

Ausfuehrliche API-Doku:

- `docs/03-api/auth.md`
- `docs/03-api/tasks.md`
- `docs/03-api/user-actions.md`
- `docs/03-api/user-game-state.md`
- `docs/03-api/user-actions-handover.md`
