# API Documentation — User Game State

Base path
---------
All game-state endpoints are rooted at:

```
/api/user
```

GET /api/user/game-state
------------------------

Purpose
-------
Return the game-related state for the currently authenticated user so the client can render the main UI (water, food, current Pokémon metadata, happiness, tasks list and login/streak information).

Authentication
--------------
- This endpoint requires an authenticated user (session-based or token-based according to the existing authentication implementation).
- Unauthenticated requests must return 401 Unauthorized.

Request
-------
- Method: GET
- Path: `/api/user/game-state`
- No body required.
- Optional future query parameter: `?date=YYYY-MM-DD` for debug or historical views.

Response (200 OK)
-----------------
Content-Type: `application/json`

Fields (JSON schema)
- `waterLevel` (integer) — current water level (DB column `hydration_ml`). Unit/scale documented for the client.
- `foodLevel` (integer) — current food level (DB column `hunger`).
- `pokemonImageUrl` (string|null) — URL of the user's current Pokémon image or `null` if none/egg.
- `pokemonLevel` (integer) — current Pokémon level (DB column `pokemon_level`).
- `growth` (integer) — progression value used by the leveling mechanic (e.g. XP/progress counter). This value increases when tasks are completed; the actual leveling (increment of `pokemonLevel`) is part of the Task Completion feature and will be implemented later. For the client this is an opaque numeric progress value.
- `happiness` (integer) — current happiness value.
- `tasks` (array of Task objects) — list of tasks visible to the user. Each Task object contains:
  - `id` (number)
  - `title` (string)
  - `completed` (boolean) — the value stored in the backend for the task (see Reset Notes below).
- `streak` (integer) — number of consecutive days the user has logged in. This value is updated by the authentication (login) flow (see "Streak update rules" below).
- `yesterdayLoggedIn` (boolean) — indicates whether the user had an active session on the previous day (used by the frontend to decide resetting the displayed task completions).
- `serverNow` (string, ISO8601 UTC) — current server time. This is provided to help the client avoid local clock drift when applying the reset heuristic.

Example response
----------------

```json
{
  "waterLevel": 120,
  "foodLevel": 50,
  "pokemonImageUrl": "https://cdn.example.com/pokemon/charmander.png",
  "pokemonLevel": 5,
  "growth": 42,
  "happiness": 7,
  "tasks": [
    { "id": 1, "title": "Brush teeth", "completed": true },
    { "id": 2, "title": "Go for a walk", "completed": false }
  ],
  "streak": 3,
  "yesterdayLoggedIn": true,
  "serverNow": "2026-06-13T07:12:00Z"
}
```

Errors
------
- `401 Unauthorized` — request is not authenticated.
- `500 Internal Server Error` — unexpected server error.

Streak update rules (Auth responsibility)
-----------------------------------------
- The `streak` value is maintained and updated by the authentication/login flow. The rules are:
  - If the user has no recorded last-login time (first login) → set `streak = 1`.
  - If the recorded `lastLoginAt` falls on the previous UTC day (yesterday) → `streak = streak + 1`.
  - Otherwise (last login was earlier than yesterday) → reset `streak = 1`.
- The authentication code must update the stored `lastLoginAt`/`streak` atomically during login to avoid race conditions (use a DB transaction or optimistic locking).

Reset behaviour for tasks (frontend responsibility for this iteration)
--------------------------------------------------------------------
- For this iteration the backend returns the current `completed` flags as stored (e.g. from `user_tasks.completed`). There is no server-side daily reset implemented yet.
- Because the `streak` will be updated during authentication, the client can rely on `yesterdayLoggedIn` (boolean) to decide whether the display should show tasks as completed or reset them for display. Recommended algorithm for the frontend on initial load after authentication:
  - If `yesterdayLoggedIn == false`, treat all `tasks[].completed` as `false` for display purposes (the user did not log in yesterday, so per-day completions should appear reset).
  - If `yesterdayLoggedIn == true`, display `tasks[].completed` as returned by the backend.
- `serverNow` is provided to help the client avoid local clock drift.
- The final server-side task completion and per-day locking logic (append-only completions, uniqueness per day, `POST /api/tasks/{id}/complete`) will be implemented in the Task Completion feature. When that feature is available, the frontend should rely on the server for correctness and remove the local reset heuristic.

Implementation notes
--------------------
- Database fields already present according to `db/prisma/schema.prisma` include: `hydration_ml`, `hunger`, `pokemon_level`, `pokemon_xp`, `happiness`, `last_login_at`, `streak`.
- The Java persistence layer currently maps `UserEntity` but does not yet expose all columns. For this API to function the following JPA mappings should exist on `UserEntity`:
  - `hydrationMl` -> `hydration_ml` (int)
  - `hunger` -> `hunger` (int)
  - `pokemonLevel` -> `pokemon_level` (int)
  - `pokemonXp` -> `pokemon_xp` (int)
  - `streak` -> `streak` (int)
- The controller that serves this endpoint should live in the `user` feature package (e.g. `io.github.luinara.sqs.user.UserController`) and delegate to a `UserService` which builds a DTO specifically for the client. Do not return the JPA entity directly (it contains internal fields such as password hash).
- Timezone policy: server timestamps are provided in UTC. All date comparisons for daily boundaries should use UTC.

Testing suggestions
-------------------
- Unit tests for the service mapping entity -> DTO, covering presence/absence of `currentPokemonId` and correct resolution of `pokemonImageUrl`.
- Unit tests for calculation/interpretation of `growth` if any logic is added later.
- Controller tests (MockMvc) to assert `401` for unauthenticated requests and full payload for authenticated ones.

File location
-------------
This documentation is stored at `docs/API_USER_GAME_STATE.md`.


Notes about `growth`
--------------------
- `growth` is a numeric value used by the client to show progress toward the next level. It increases when tasks are completed. The actual leveling operation that increments `pokemonLevel` and consumes/uses `growth` will be implemented in the Task Completion feature (server-side). For now `growth` is provided as an informational progress metric only.

Next steps
----------
1. The authentication flow will be updated (in a separate change) to apply the `streak` update rules described above during login.
2. After that is in place I will implement the `user`-package changes: add the missing JPA mappings, implement `UserController#getGameState`, add DTOs and unit + controller tests.
3. Later: implement the Task Completion feature (append-only completions, server-side per-day uniqueness and `POST /api/tasks/{id}/complete`).
