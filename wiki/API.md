# API

Das Backend stellt REST-Endpunkte unter `/api` bereit. Authentifizierung läuft
über eine serverseitige Session mit `JSESSIONID`.

## Auth

| Methode | Pfad | Zweck |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Nutzer registrieren und Session starten |
| `POST` | `/api/auth/login` | Nutzer anmelden |
| `POST` | `/api/auth/logout` | Session beenden |

## Tasks und Spielstand

| Methode | Pfad | Zweck |
| --- | --- | --- |
| `GET` | `/api/tasks` | Öffentliche Task-Liste laden |
| `POST` | `/api/tasks/{id}/complete` | Task abschließen |
| `GET` | `/api/user/game-state` | Spielstand laden |
| `POST` | `/api/user/water` | Wasserstand speichern |
| `POST` | `/api/user/feed` | Pokémon trainieren |
| `DELETE` | `/api/user/account` | Account löschen |

## Frontend-Anbindung

Das Angular-Frontend ruft die API nicht direkt aus Komponenten auf. Die
Kapselung liegt in:

- `frontend/src/app/core/services/backend-api.service.ts`
- `frontend/src/app/core/services/app-state.service.ts`

Ausführliche API-Doku:

- `docs/03-api/auth.md`
- `docs/03-api/tasks.md`
- `docs/03-api/user-actions.md`
- `docs/03-api/user-game-state.md`
- `docs/03-api/user-actions-handover.md`
