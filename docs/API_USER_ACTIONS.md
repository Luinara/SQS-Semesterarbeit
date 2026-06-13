# API — Benutzeraktionen: Water & Feed

Dieses Dokument beschreibt die zwei neuen Endpunkte, mit denen der Client das Trinken (water) und das Füttern (feed) des Pokémon des eingeloggten Users anstoßen kann.

Hinweis: Authentifizierung wie im Projektstandard (Session / USER_TOKEN) wird erwartet. Alle Zeiten und Werte verwenden UTC‑Konventionen, Responses enthalten `GameStateDto` (siehe `docs/API_USER_GAME_STATE.md`).

Allgemeines
-----------
- Basis‑Pfad: `/api/user`
- Auth: erforderlich (Session/Token, wie in `AuthenticationController`) für beide Endpunkte.
- Rückgabe: Nach erfolgreicher Aktion wird der aktuelle GameState als `GameStateDto` zurückgegeben (inkl. `waterLevel`, `pendingFeedPoints`, `happiness`, `pokemonLevel`, `pokemonImageUrl`, u.a.).

POST /api/user/water
--------------------
- Zweck: Erhöht den Wasserspeicher (wasser level) des eingeloggten Users um die angegebene Menge in Millilitern.
- Auth: erforderlich.
- Request:
  - Method: POST
  - Path: `/api/user/water`
  - Body (JSON):
    - `ml` (number) — Milliliter, die dem Wasserspeicher hinzugefügt werden. (Frontend: drei Buttons senden unterschiedliche `ml`‑Werte.)

- Verhalten:
  - Der Server erhöht `user.hydrationMl += ml` und persistiert den neuen Wert.
  - Der Server gibt den aktualisierten `GameStateDto` zurück.
  - Das Frontend kann anhand von `waterLevel` erkennen, ob ein lokales Questziel erreicht ist (z. B. 3000 ml). Das Entsperren / Anzeigen eines Questabschlusses übernimmt das Frontend; der Server liefert als einzige Quelle den aktuellen `waterLevel`.

- Responses:
  - 200 OK — JSON body: aktuellers `GameStateDto`.
  - 401 Unauthorized — kein gültiger Login / Session.
  - 404 Not Found — Benutzer nicht gefunden (sollte in DB‑Mode nur bei Inkonsistenzen auftreten).
  - 500 Internal Server Error — unerwarteter Fehler.

Beispiel Request

```
POST /api/user/water
Content-Type: application/json
{
  "ml": 250
}
```

Beispiel Response (auszugsweise)

```
{
  "waterLevel": 1250,
  "pendingFeedPoints": 12,
  "happiness": 40,
  "pokemonLevel": 5,
  "pokemonImageUrl": "/assets/charmander.png",
  "serverNow": "2026-06-13T07:12:00Z"
}
```

POST /api/user/feed
-------------------
- Zweck: Wandelt die angesammelten Futter‑Punkte (die Tasks als `feed_points` vergeben) in `happiness` um.
- Auth: erforderlich.
- Request:
  - Method: POST
  - Path: `/api/user/feed`
  - Body: none

- Verhalten (Server):
  - Der Server liest `user.pendingFeedPoints` (gesammelt durch Task‑Abschlüsse) und `user.happiness`.
  - Er wendet so viele Feed‑Punkte an, wie nötig, um die `happiness` bis maximal 100 zu erhöhen (Konversion: 1 feedPoint -> 1 happiness‑Punkt). Beispiel: bei `pendingFeedPoints = 30` und `happiness = 85` werden 15 Punkte angewandt, `happiness` = 100, `pendingFeedPoints` = 15 (Rest bleibt erhalten).
  - Der Server persistiert die Änderung (`happiness` und verbleibende `pendingFeedPoints`) und gibt den aktualisierten `GameStateDto` zurück.

- Responses:
  - 200 OK — JSON body: aktueller `GameStateDto`.
  - 401 Unauthorized — kein gültiger Login / Session.
  - 404 Not Found — Benutzer nicht gefunden.
  - 500 Internal Server Error — unerwarteter Fehler.

Beispiel Request

```http
POST /api/user/feed
```

Beispiel Response

```json
{
  "waterLevel": 1250,
  "pendingFeedPoints": 15,
  "happiness": 100,
  "pokemonLevel": 5,
  "serverNow": "2026-06-13T07:14:00Z"
}
```

Zusammenspiel mit Tasks
-----------------------
- Tasks haben jetzt ein Feld `feed_points` (DB‑Spalte `feed_points`).
- Beim Abschließen einer Task (`POST /api/tasks/{id}/complete`) werden die `feed_points` dieser Task dem Feld `user.pendingFeedPoints` hinzugefügt. Die Task‑Abschluss‑Action selbst erhöht nicht mehr direkt `happiness` — das geschieht durch die separate `POST /api/user/feed` Aktion.
- Growth (Pokemon XP), Level‑Ups, Hatch und Evolution bleiben beim Task‑Abschluss wie dokumentiert erhalten.

Frontend‑Hinweise
------------------
- Für das Trinken gibt es drei Buttons (z. B. 250ml / 500ml / 1000ml). Jeder Button sendet ein `POST /api/user/water` mit dem entsprechenden `ml`‑Wert.
- Das Frontend entscheidet, wann eine Quest (z. B. "Trink 3000ml") als erfüllbar angezeigt wird: wenn `gameState.waterLevel >= 3000`.
- Für Füttern: das Frontend zeigt die verfügbare `pendingFeedPoints` aus `gameState.pendingFeedPoints`. Nutzer können den Füttern‑Button drücken (POST /api/user/feed), um Punkte in `happiness` umzuwandeln.

Tests & Verhaltenserwartungen
----------------------------
- Unit‑Tests sollten folgende Fälle abdecken:
  - `POST /api/user/water` erhöht `waterLevel` um das übermittelte `ml`.
  - `POST /api/user/feed` wandelt pendingFeedPoints korrekt in `happiness` um (inkl. Randfälle: genaues Auffüllen auf 100, Restpunkte bleiben erhalten).
  - Interaktion mit Tasks: Abschluss einer Task erhöht `pendingFeedPoints` um `task.feed_points`.

Migration & DB‑Hinweis
----------------------
- Neue Spalte in `tasks` (feed_points) ist bereits in der JPA‑Entity `TaskEntity` vorhanden. Falls ihr mit Prisma/SQL migriert, legt eine Migration an, die `feed_points` (integer default 0) zur `tasks`‑Tabelle hinzufügt.
- Neue Spalte in `users` (pending_feed_points) ist in `UserEntity` vorhanden und muss analog in die DB gemigt werden.

