# API Documentation — Tasks

Dieses Dokument beschreibt die Task‑APIs: öffentliche Taskliste und das Melden des Abschlusses einer Task durch den eingeloggten Benutzer.

Wichtig: Für diese Iteration werden keine Datenbank‑Schemata verändert. Die kurzfristige Implementierung nutzt die vorhandene `tasks`‑Tabelle (und ggf. die Zuordnung `user_tasks`) für die persistente Speicherung. Langfristig wird ein `TaskCompletion`‑Log (append‑only) empfohlen — siehe Plan‑Dokumentation.

## Basis‑Pfad

```
/api/tasks
```

## Authentifizierung

- `GET /api/tasks` ist öffentlich und benötigt keine Authentifizierung.
- `POST /api/tasks/{taskId}/complete` erfordert einen authentifizierten Benutzer (Session/Token wie bestehende Authentifizierung).

## GET /api/tasks

- Zweck: Liefert die öffentliche Liste aller Tasks. Keine User‑bezogenen Completion‑Informationen werden hier zurückgegeben.
- Auth: optional (keine Auth nötig)
- Request: GET /api/tasks
- Response 200 JSON: Array von Task‑Objekten (siehe DTO `TaskPublicDto`)

TaskPublicDto (response schema)

- `id` (number)
- `title` (string)
- `description` (string)

Beispiel:

```json
[
  {
    "id": 1,
    "title": "Brush teeth",
    "description": "Brush your teeth each morning"
  },
  { "id": 2, "title": "Walk", "description": "Take a short walk outside" }
]
```

## POST /api/tasks/{taskId}/complete

- Zweck: Meldet dem Server, dass der aktuell eingeloggte Benutzer die Task `taskId` abgeschlossen hat. Der Server wendet die Spiel‑Effekte an (Happiness, Growth, Level, ggf. Hatch/Evolution) und liefert den aktualisierten Spielzustand zurück.
- Auth: erforderlich (Session/Token). Nicht‑authentifizierte Anfragen -> 401 Unauthorized.
- Request:
  - Method: POST
  - Path: `/api/tasks/{taskId}/complete` (taskId als path param)
  - Body: optionales Meta‑Objekt (nicht erforderlich in dieser Iteration)
- Response:
  - 200 OK — die Task wurde neu für den User markiert als abgeschlossen, Effekte angewendet. Body enthält ein `gameState`‑Objekt (entspricht `GameStateDto`, siehe `docs/API_USER_GAME_STATE.md`) mit aktualisierten Werten: `happiness`, `growth`, `pokemonLevel`, `pokemonImageUrl`, `serverNow`, `streak`, `tasks` (optional).
  - 404 Not Found — Task mit `taskId` existiert nicht.
  - 401 Unauthorized — kein gültiger Login vorhanden.
  - 409 Conflict — die Task ist bereits als abgeschlossen für diesen Benutzer gespeichert (für diese Iteration: `user_tasks.completed == true`).
  - 500 Internal Server Error — unerwarteter Fehler.

Wesentliche Semantik (kurz)

- Die Aktion führt zu folgenden Effekten (konfigurierbar):
  - Happiness: Wird inkrementiert proportional zur Anzahl aller Tasks (N). Bei N Tasks erhöht jede Task die Happiness um (100 / N) Prozent; beim Abschluss der letzten Task eines Tages wird Happiness sicher auf 100 gesetzt.
  - Growth: Erhöht um einen festen Wert (z. B. +10 XP) pro Task; sobald Growth >= 100, kommt es zu Level‑Ups (ein Level pro 100 XP), Überschuss bleibt in Growth (XP % 100).
  - Level: erhöht sich bei Growth‑Grenzüberschreitung, Level‑abhängige Effekte:
    - Beim Erreichen von Level >= 10: Wenn `isEgg == true`, wird das Pokémon ausgebrütet (isEgg=false und `hatchedAt` gesetzt).
    - Bei Erreichen von Level >= 25 und >= 50: Wenn `evolutionId` vorhanden ist, wird das Pokémon einmal bzw. zweimal weiterentwickelt (sofern Evolutionskette vorhanden).
- Implementation‑Hinweis: In dieser Iteration wird für Persistenz das vorhandene Modell `user_tasks` (boolean `completed`) verwendet; langfristig wird ein `task_completions`‑Log empfohlen, das Tages‑Eindeutigkeit robust handhabt.

Tagesgrenzen / Reset (Frontend / Übergangsregel)

- Übergangsregel: Der tägliche Reset der Anzeige wird in der aktuellen Iteration vom Frontend gehandhabt (siehe `docs/API_USER_GAME_STATE.md`).
- Hinweis für Backend‑Integratoren: Weil aktuell kein `TaskCompletion`‑Log vorhanden ist, kann der Server nur den `user_tasks.completed`‑Wert setzen; ein echtes "1x pro UTC‑Tag"‑Semantik wird erst mit dem späteren DB‑Änderungs‑Feature umgesetzt.

Idempotency und Fehlerverhalten

- Wenn der Server bei Einfügen/Setzen erkennt, dass die Task bereits für denselben Benutzer als abgeschlossen markiert ist, liefert er 409 Conflict.
- Hinweis: Wenn in Zukunft `TaskCompletion` eingeführt wird, sollte der Server stattdessen eine Unique‑Constraint pro (user, task, date) verwenden und 409 bei Duplikaten zurückgeben.

Effekt‑Payload (Beispielantwort nach erfolgreichem Abschluss)

```json
{
  "success": true,
  "gameState": {
    "waterLevel": 120,
    "foodLevel": 50,
    "pokemonImageUrl": "https://cdn.example.com/pokemon/charmander.png",
    "pokemonLevel": 5,
    "growth": 42,
    "happiness": 66,
    "tasks": [],
    "streak": 3,
    "yesterdayLoggedIn": true,
    "serverNow": "2026-06-13T07:12:00Z"
  }
}
```

Sicherheitsaspekte

- Die POST‑Operation darf nur vom authentifizierten Nutzer ausgeführt werden. Die Controller MUSS den Benutzernamen aus der Session/Token ableiten (wie in `AuthenticationController`) und darf keine `userId`‑Parameter vom Client akzeptieren.

Tests (Empfehlung)

- Unit‑Tests für `TaskService.completeTaskForUser` (mocked `UserRepository`, `TaskRepository`, `UserTaskRepository`):
  - single completion applies XP/happiness/level changes
  - second completion same day -> 409
  - completing last task sets happiness to 100
  - hatch/evolution edge cases
- Integrationstests (Testcontainers): End‑to‑end Szenarien mit echter DB‑Migration (wenn TaskCompletion später eingeführt)

Implementationshinweise / Roadmap

- Kurzfristig (kein DB‑Change):
  - Implementiere `GET /api/tasks` aus `Task`‑Tabelle.
  - Implementiere `POST /api/tasks/{id}/complete` welches `user_tasks.completed=true` setzt (wenn ein Eintrag für user+task existiert, updaten; andernfalls anlegen) und die Effects anwendet.
- Mittelfristig (geplanter Change):
  - Führe `TaskCompletion` append‑only‑Tabelle ein (Prisma + Migration), passe POST‑Logik an, entferne `user_tasks.completed` oder migriere sie in `task_completions`.

Frontend‑Hinweis

- Nach erfolgreichem POST sollte das Frontend die lokale Darstellung des Benutzers aktualisieren mit den aus `gameState` zurückgegebenen Werten (happiness, growth, pokemonLevel, pokemonImageUrl). Bei 409 kann das Frontend optional das GameState neu laden (GET /api/user/game-state).
- Level-Ups sind serverseitig auf frühestens alle zwei Tage begrenzt. Wenn der Wachstumswert voll ist, aber der Cooldown aktiv bleibt, hält der Server `growth` am Cap und erhöht `pokemonLevel` erst bei einer späteren qualifizierenden Aktion.

Dateiablage

- Diese Doku liegt in `docs/API_TASKS.md`.
