# API-Dokumentation: User Game State

## Basis-Pfad

Alle Game-State-Endpunkte liegen unter:

```txt
/api/user
```

## GET /api/user/game-state

## Zweck

Liefert den spielbezogenen Zustand des aktuell authentifizierten Users.

Das Frontend nutzt die Daten für Questliste, Wasserstand, Energie, Pal-Daten, Motivation, Quest-Punkte und Anmelde-Serie.

## Authentifizierung

* Der Endpunkt erfordert einen authentifizierten User.
* Die Authentifizierung erfolgt gemäß bestehender Auth-Doku über Session bzw. Token.
* Nicht authentifizierte Requests liefern `401 Unauthorized`.

## Request

* Methode: GET
* Pfad: `/api/user/game-state`
* Kein Request Body erforderlich.
* Optionaler zukünftiger Query-Parameter: `?date=YYYY-MM-DD` für Debug- oder Historienansichten.

## Response: 200 OK

Content-Type: `application/json`

Felder im JSON:

* `waterLevel` (integer): aktueller Wasserstand aus `hydration_ml`.
* `foodLevel` (integer): aktueller Energiewert aus `hunger`.
* `palImageUrl` (string|null): URL zum aktuellen Pal-Bild oder `null`, wenn noch kein Bild verfügbar ist.
* `palLevel` (integer): aktuelles Pal-Level aus `pal_level`.
* `growth` (integer): Fortschritt Richtung nächstes Level.
* `happiness` (integer): aktueller Motivationswert.
* `pendingFeedPoints` (integer): technisch gespeicherte Quest-Punkte aus abgeschlossenen Tasks.
* `tasks` (array): Aufgaben, die im Frontend sichtbar sind.
* `streak` (integer): Anzahl aufeinanderfolgender Login-Tage.
* `yesterdayLoggedIn` (boolean): zeigt, ob am Vortag eine aktive Session vorhanden war.
* `serverNow` (string, ISO8601 UTC): aktuelle Serverzeit, damit das Frontend nicht von der lokalen Uhr abhängig ist.

Ein Task-Objekt enthält:

* `id` (number)
* `title` (string)
* `completed` (boolean): im Backend gespeicherter Abschlussstatus der Task.

## Beispiel-Response

```json
{
  "waterLevel": 120,
  "foodLevel": 50,
  "palImageUrl": "https://cdn.example.com/pal/starter-pal.png",
  "palLevel": 5,
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

## Fehler

* `401 Unauthorized`: Request ist nicht authentifiziert.
* `500 Internal Server Error`: unerwarteter Serverfehler.

## DELETE /api/user/account

## Zweck

Löscht den aktuell authentifizierten User-Account.

Dabei werden auch userbezogene Fortschrittsdaten gelöscht und die aktuelle Session invalidiert.

## Authentifizierung

* Der Endpunkt erfordert eine authentifizierte Session.
* Nicht authentifizierte Requests liefern `401 Unauthorized`.

## Request

* Methode: DELETE
* Pfad: `/api/user/account`
* Kein Request Body erforderlich.

## Responses

* `204 No Content`: Account wurde gelöscht und die Session invalidiert.
* `401 Unauthorized`: Request ist nicht authentifiziert.
* `404 Not Found`: Die Session verweist auf einen User, der nicht mehr existiert.

## Persistenz-Hinweise

* Das Backend löscht `user_tasks`-Einträge vor dem Löschen des `users`-Eintrags.
* Prisma-Migrationen konfigurieren userbezogene `user_stats`- und `user_tasks`-Relationen mit `ON DELETE CASCADE`.

## Streak und Inactivity Decay

Der Login-Flow aktualisiert `lastLoginAt`, `streak` und bei verpassten Tagen auch den Spielstand.

Regeln für die Login-Serie:

* Erster Login: `streak = 1`
* Letzter Login war gestern: `streak = streak + 1`
* Letzter Login war heute: Streak bleibt unverändert.
* Letzter Login war älter als gestern: `streak = 1`

Wenn mindestens ein kompletter Kalendertag ausgelassen wurde, greift zusätzlich eine kleine Strafe.

Regeln für verpasste Tage:

* Pro verpasstem Tag: `palLevel - 1`, aber nie unter Level `1`.
* Pro verpasstem Tag: `happiness - 10`, aber nie unter `0`.
* Wenn ein Level verloren geht, wird `growth` auf `0` gesetzt.

Beispiel: letzter Login am 14.06., nächster Login am 16.06.

Der 15.06. wurde verpasst, daher verliert das Pal ein Level und 10 Motivation.

## Tagesreset für Wasser und Tasks

Der Reset ist nicht an einen erneuten Login gekoppelt.

Der Server bewertet den Reset bei `GET /api/user/game-state` und vor relevanten Spielstandsaktionen.

Das Frontend aktualisiert den Dashboard-Spielstand in einer laufenden Session regelmäßig.

Dadurch wird der Reset nach Ablauf des Intervalls sichtbar.

* Standard und Dev-Profil: `palhabit.daily-reset-interval=PT24H`.
* Für manuelle Kurztests kann temporär `palhabit.daily-reset-interval=PT1M` genutzt werden.
* Diese Kurztest-Konfiguration wird nicht dauerhaft eingecheckt.
* Wenn das Intervall erreicht ist, wird `hydration_ml` auf `0` gesetzt.
* Wenn das Intervall erreicht ist, werden alle `user_tasks.completed`-Flags des Users auf `false` gesetzt.
* Login-Streak und Inaktivitätsstrafe bleiben an UTC-Kalendertage gekoppelt.
* `last_daily_reset_at` speichert den letzten Reset-Zeitpunkt.

`serverNow` hilft dem Client, nicht von der lokalen Browser-Uhr abhängig zu sein.

Die Reset-Schwelle wird im Backend anhand der Serverzeit bewertet.

## Implementierungshinweise

Relevante Datenbankfelder:

* `hydration_ml`
* `hunger`
* `pal_level`
* `pal_xp`
* `happiness`
* `pending_feed_points`
* `last_level_up_at`
* `last_login_at`
* `last_daily_reset_at`
* `streak`

Die Java-Persistenzschicht mappt diese Felder über `UserEntity`:

* `hydrationMl` -> `hydration_ml` (int)
* `hunger` -> `hunger` (int)
* `palLevel` -> `pal_level` (int)
* `palXp` -> `pal_xp` (int)
* `streak` -> `streak` (int)
* `pendingFeedPoints` -> `pending_feed_points` (int)
* `lastLevelUpAt` -> `last_level_up_at` (timestamp)
* `lastDailyResetAt` -> `last_daily_reset_at` (timestamp)

Der Controller liegt im `user`-Feature-Package.

Pfad: `io.github.luinara.sqs.user.UserController`

Der Controller delegiert an `UserService`.

`UserService` baut DTOs speziell für den Client.

Die API gibt keine JPA-Entities direkt zurück.

## Zeitzonen-Regel

Server-Zeitstempel werden in UTC bereitgestellt.

Alle Datumsvergleiche für Tagesgrenzen verwenden UTC.

## Testabdeckung

* Unit- und Controller-Tests decken Service-Mapping, unauthentifizierte Requests, Account-Löschung und Spielstandsaktionen ab.
* `UserServiceTest` prüft den Tagesreset mit `Duration.ofMinutes(1)` ohne realen Wartezeitraum.
* Dabei werden Wasser auf `0` gesetzt, Quest-Completions zurückgesetzt und `lastDailyResetAt` aktualisiert.
* `SelfCareApplicationTests` prüft Spring-Kontext, zentrale Beans, aktives `test`-Profil, H2-In-Memory-Datenbank und UTC-`Clock`-Bean.
* Frontend-Service-Tests prüfen das Mapping der Backend-Payloads in UI-Modelle.
* Der Docker Quality Hub führt Backend-, Frontend-, Security-, Coverage- und E2E-Checks gesammelt aus.

## Dateiablage

Diese Doku liegt unter:

```txt
docs/03-api/user-game-state.md
```

## Hinweise zu `growth`

`growth` ist der numerische Fortschritt zum nächsten Level.

Der Wert steigt beim Abschluss von Tasks.

Wenn `growth >= 100` und der 2-Tage-Cooldown seit `lastLevelUpAt` erfüllt ist, erhöht das Backend `palLevel`.

Danach setzt das Backend `growth` zurück und aktualisiert `lastLevelUpAt`.

## Bekannte Erweiterungen

1. Optional append-only Task-Completions pro Datum modellieren, wenn eine Historie pro Tag benötigt wird.
2. Optional weitere echte Backend-E2E-Flows ergänzen, wenn Testdaten-Isolation für parallele Runs eingeführt wird.
