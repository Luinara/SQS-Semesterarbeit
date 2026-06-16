# API-Dokumentation — User Game State

## Basis-Pfad

Alle Game-State-Endpunkte hängen unter:

```
/api/user
```

## GET /api/user/game-state

## Zweck

Liefert den spielbezogenen Zustand des aktuell authentifizierten Users, damit das Frontend Questliste, Wasserstand, Energie, Pokémon-Daten, Motivation, Trainingspunkte und Anmelde-Serie rendern kann.

## Authentifizierung

- Der Endpunkt erfordert einen authentifizierten User (Session-basiert oder Token-basiert gemäß bestehender Authentifizierung).
- Nicht authentifizierte Requests liefern `401 Unauthorized`.

## Request

- Method: GET
- Path: `/api/user/game-state`
- No body required.
- Optional future query parameter: `?date=YYYY-MM-DD` for debug or historical views.

## Response (200 OK)

Content-Type: `application/json`

Fields (JSON schema)

- `waterLevel` (integer) — aktueller Wasserstand aus `hydration_ml`.
- `foodLevel` (integer) — aktueller Energiewert aus `hunger`.
- `pokemonImageUrl` (string|null) — URL zum aktuellen Pokémon-Bild oder `null`, wenn noch kein Bild verfügbar ist.
- `pokemonLevel` (integer) — aktuelles Pokémon-Level aus `pokemon_level`.
- `growth` (integer) — Fortschritt Richtung nächstes Level. Der Wert steigt beim Abschließen von Tasks bis maximal `100`. Wenn der 2-Tage-Cooldown erfüllt ist, erhöht das Backend `pokemonLevel` und setzt `growth` auf `0`.
- `happiness` (integer) — aktueller Motivationswert.
- `pendingFeedPoints` (integer) — verfügbare Trainingspunkte aus abgeschlossenen Tasks. Diese Punkte kann das Frontend über `POST /api/user/feed` in Motivation umwandeln.
- `tasks` (array of Task objects) — Aufgaben, die im Frontend sichtbar sind. Jeder Eintrag enthält:
  - `id` (number)
  - `title` (string)
  - `completed` (boolean) — im Backend gespeicherter Abschlussstatus der Task.
- `streak` (integer) — Anzahl aufeinanderfolgender Login-Tage; wird im Login-Flow aktualisiert.
- `yesterdayLoggedIn` (boolean) — zeigt, ob am Vortag eine aktive Session vorhanden war.
- `serverNow` (string, ISO8601 UTC) — aktuelle Serverzeit, damit das Frontend nicht von der lokalen Uhr abhängig ist.

## Example response

```json
{
  "waterLevel": 120,
  "foodLevel": 50,
  "pokemonImageUrl": "https://cdn.example.com/pokemon/charmander.png",
  "pokemonLevel": 5,
  "growth": 42,
  "happiness": 7,
  "pendingFeedPoints": 12,
  "tasks": [
    { "id": 1, "title": "Brush teeth", "completed": true },
    { "id": 2, "title": "Go for a walk", "completed": false }
  ],
  "streak": 3,
  "yesterdayLoggedIn": true,
  "serverNow": "2026-06-13T07:12:00Z"
}
```

## Errors

- `401 Unauthorized` — request is not authenticated.
- `500 Internal Server Error` — unexpected server error.

## DELETE /api/user/account

## Purpose

Delete the currently authenticated user's account, including user-owned progress such as task completion rows, and invalidate the current session.

## Authentication

- This endpoint requires an authenticated session.
- Unauthenticated requests return `401 Unauthorized`.

## Request

- Method: DELETE
- Path: `/api/user/account`
- No body required.

## Responses

- `204 No Content` — account was deleted and the session was invalidated.
- `401 Unauthorized` — request is not authenticated.
- `404 Not Found` — the session pointed to a user that no longer exists.

## Persistence notes

- The backend deletes `user_tasks` rows before deleting the `users` row.
- Prisma migrations configure user-owned `user_stats` and `user_tasks` relations with `ON DELETE CASCADE`.

## Streak update rules (Auth responsibility)

- The `streak` value is maintained and updated by the authentication/login flow. The rules are:
  - If the user has no recorded last-login time (first login) → set `streak = 1`.
  - If the recorded `lastLoginAt` falls on the previous UTC day (yesterday) → `streak = streak + 1`.
  - Otherwise (last login was earlier than yesterday) → reset `streak = 1`.
- The authentication code must update the stored `lastLoginAt`/`streak` atomically during login to avoid race conditions (use a DB transaction or optimistic locking).

## Reset-Verhalten für Tasks (Frontend-Verantwortung in dieser Iteration)

- For this iteration the backend returns the current `completed` flags as stored (e.g. from `user_tasks.completed`). There is no server-side daily reset implemented yet.
- Weil `streak` während der Authentifizierung aktualisiert wird, kann der Client `yesterdayLoggedIn` nutzen, um zu entscheiden, ob die Anzeige erledigte Tasks übernimmt oder für die Tagesansicht zurücksetzt. Empfohlener Algorithmus beim initialen Laden:
  - If `yesterdayLoggedIn == false`, treat all `tasks[].completed` as `false` for display purposes (the user did not log in yesterday, so per-day completions should appear reset).
  - If `yesterdayLoggedIn == true`, display `tasks[].completed` as returned by the backend.
- `serverNow` is provided to help the client avoid local clock drift.
- Eine robuste serverseitige Tageshistorie mit append-only Completions und Eindeutigkeit pro Tag ist als bekannte fachliche Erweiterung dokumentiert. Für den aktuellen Abgabestand verlässt sich das Frontend bei Taskabschluss und Wasser-Autoabschluss auf die Serverantwort.

## Implementation notes

- Relevante Datenbankfelder: `hydration_ml`, `hunger`, `pokemon_level`, `pokemon_xp`, `happiness`, `pending_feed_points`, `last_level_up_at`, `last_login_at`, `streak`.
- Die Java-Persistenzschicht mappt diese Felder über `UserEntity`:
  - `hydrationMl` -> `hydration_ml` (int)
  - `hunger` -> `hunger` (int)
  - `pokemonLevel` -> `pokemon_level` (int)
  - `pokemonXp` -> `pokemon_xp` (int)
  - `streak` -> `streak` (int)
  - `pendingFeedPoints` -> `pending_feed_points` (int)
  - `lastLevelUpAt` -> `last_level_up_at` (timestamp)
- The controller lives in the `user` feature package (`io.github.luinara.sqs.user.UserController`) and delegates to `UserService`, which builds DTOs specifically for the client. The API does not return JPA entities directly.
- Timezone policy: server timestamps are provided in UTC. All date comparisons for daily boundaries should use UTC.

## Testabdeckung

- Unit- und Controller-Tests decken Service-Mapping, unauthentifizierte Requests, Account-Löschung und Spielstand-Aktionen ab.
- Frontend-Service-Tests prüfen das Mapping der Backend-Payloads in die UI-Modelle.
- Der Docker Quality Hub führt Backend-, Frontend-, Security-, Coverage- und E2E-Checks gesammelt aus.

## File location

This documentation is stored at `docs/API_USER_GAME_STATE.md`.

## Notes about `growth`

- `growth` ist der numerische Fortschritt zum nächsten Level. Es steigt beim Abschluss von Tasks. Wenn `growth >= 100` und der 2-Tage-Cooldown seit `lastLevelUpAt` erfüllt ist, erhöht das Backend `pokemonLevel`, setzt `growth` zurück und aktualisiert `lastLevelUpAt`.

## Bekannte Erweiterungen

1. Serverseitigen Daily-Reset beziehungsweise append-only Task-Completions modellieren.
2. Optional weitere echte Backend-E2E-Flows ergänzen, wenn Testdaten-Isolation für parallele Runs eingeführt wird.
