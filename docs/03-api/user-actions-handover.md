# User-Actions API Handover

Diese Doku beschreibt, was unsere App aktuell im Frontend macht und welche Aktionen an Backend, API und Datenbank angebunden werden sollen.

## Kurzbeschreibung Der App

Unsere App ist eine pet-basierte Productivity- und Self-Care-App.

User erledigen kleine Tagesaufgaben wie:

- Wasser trinken
- 30 Minuten lernen
- Sport
- Zimmer aufräumen
- 10 Seiten lesen

Dafür bekommen sie Punkte. Diese Punkte können genutzt werden, um ein virtuelles Pet zu füttern. Das Pet bekommt dadurch Fortschritt, Happiness und Level-Ups.

Aktuell passiert diese Logik noch lokal im Angular-Frontend:

- Datei: `frontend/src/app/core/services/app-state.service.ts`
- Mock-Daten: `frontend/src/app/shared/mock/mock-data.ts`
- Speicherung: `localStorage`

Ziel: Diese Aktionen sollen per REST-API ans Spring-Boot-Backend geschickt und in PostgreSQL gespeichert werden.

## Ziel Der Datenbank-/API-Anbindung

Wenn ein User in der App eine Aktion ausführt, soll das Frontend nicht mehr nur lokalen State ändern.

Stattdessen:

1. Frontend sendet einen Request an das Backend.
2. Backend prüft die Aktion.
3. Backend speichert die Aktion in der Datenbank.
4. Backend aktualisiert Punkte, Task-Fortschritt, Hydration oder Pet-State.
5. Backend gibt den neuen Zustand an das Frontend zurück.

## User-Aktionen

### 1. Task Abschließen

Beispiele:

- "Wasser trinken"
- "Zimmer aufräumen"
- "30 Minuten lernen"
- "Sport"
- "10 Seiten lesen"

Frontend-Aktion aktuell:

```text
AppStateService.completeTask(taskId)
```

Gewünschter API-Endpunkt:

```http
POST /api/users/{userId}/tasks/{taskId}/complete
```

Beispiel:

```http
POST /api/users/user-123/tasks/task-clean-room/complete
```

Backend soll:

- prüfen, ob User existiert
- prüfen, ob Task existiert
- prüfen, ob der Task heute schon abgeschlossen wurde
- Completion in der Datenbank speichern
- Punkte zum User/Pet-Fortschritt addieren
- aktualisierten Dashboard-State zurückgeben

Wichtig:

- Ein Task darf pro User pro Tag nur einmal Punkte geben.
- Ein zweiter Klick auf denselben Task soll keine doppelten Punkte erzeugen.

Beispiel-Response:

```json
{
  "success": true,
  "message": "Task abgeschlossen.",
  "dashboard": {
    "completedTasks": 2,
    "totalTasks": 5,
    "earnedPointsToday": 25,
    "availableFoodPoints": 25
  }
}
```

### 2. Wasser Trinken / Hydration Speichern

Frontend-Aktion aktuell:

```text
AppStateService.addHydration(amountMl)
```

Gewünschter API-Endpunkt:

```http
POST /api/users/{userId}/hydration
```

Request-Body:

```json
{
  "amountMl": 250
}
```

Backend soll:

- Hydration-Eintrag speichern
- Tagesmenge für den User berechnen
- prüfen, ob das Tagesziel erreicht wurde
- aktualisierten Hydration-State zurückgeben

Beispiel-Response:

```json
{
  "hydrationMl": 1250,
  "hydrationGoalMl": 3000,
  "goalReached": false
}
```

### 3. Pet Füttern

Frontend-Aktion aktuell:

```text
AppStateService.feedPet()
```

Gewünschter API-Endpunkt:

```http
POST /api/users/{userId}/pet/feed
```

Backend soll:

- prüfen, ob der User genug Futterpunkte hat
- Futterpunkte abziehen
- Pet-Wachstum erhöhen
- Happiness erhöhen
- ggf. Level-Up auslösen
- Pet-Event speichern
- aktualisierten Pet-State zurückgeben

Beispiel-Response:

```json
{
  "success": true,
  "message": "Pet wurde gefüttert.",
  "pet": {
    "name": "Mochi",
    "level": 1,
    "growthProgress": 25,
    "growthGoal": 100,
    "availableFoodPoints": 15,
    "happiness": 10,
    "hunger": 0,
    "hearts": 3,
    "mealsServed": 1
  }
}
```

### 4. Dashboard Laden

Das Frontend braucht nach Login oder Refresh einen kompletten Zustand.

Gewünschter API-Endpunkt:

```http
GET /api/users/{userId}/dashboard
```

Backend soll zurückgeben:

- User
- Pet
- Tasks inklusive `isCompleted` für heute
- Hydration-Fortschritt für heute
- Punkte
- Tagesfortschritt

Beispiel-Response:

```json
{
  "user": {
    "id": "user-123",
    "email": "demo@sqs.app",
    "userName": "Lina",
    "joinedAt": "2026-06-09T10:00:00Z"
  },
  "pet": {
    "name": "Mochi",
    "level": 1,
    "growthProgress": 0,
    "growthGoal": 100,
    "availableFoodPoints": 0,
    "happiness": 0,
    "hunger": 0,
    "hearts": 3,
    "mealsServed": 0
  },
  "tasks": [
    {
      "id": "task-water",
      "title": "Wasser trinken",
      "description": "Eine kurze Pause, die Energie für Kopf und Fokus zurückbringt.",
      "icon": "drop",
      "tone": "peach",
      "points": 10,
      "isCompleted": false
    }
  ],
  "hydrationMl": 0,
  "hydrationGoalMl": 3000,
  "totalCompletedTasks": 0,
  "totalEarnedPoints": 0
}
```

### 5. Fortschritt Zurücksetzen

Frontend-Aktion aktuell:

```text
AppStateService.resetCurrentProgress()
```

Gewünschter API-Endpunkt:

```http
POST /api/users/{userId}/progress/reset
```

Backend soll:

- Tagesfortschritt zurücksetzen
- Task-Completions für heute entfernen oder als zurückgesetzt markieren
- Hydration für heute zurücksetzen
- Pet auf Startwerte setzen oder gemäß fachlicher Entscheidung nur Tageswerte resetten
- neuen Dashboard-State zurückgeben

## Benötigte Tabellen

### users

Speichert registrierte User.

Wichtige Felder:

- `id`
- `email`
- `username`
- `password_hash`
- `created_at`
- `updated_at`

### tasks

Speichert verfügbare Standard-Tasks.

Wichtige Felder:

- `id`
- `title`
- `description`
- `icon`
- `tone`
- `points`
- `active`
- `created_at`
- `updated_at`

### user_task_completions

Speichert, welche Tasks ein User erledigt hat.

Wichtige Felder:

- `id`
- `user_id`
- `task_id`
- `completed_at`
- `completion_date`
- `earned_points`

Constraint:

```text
unique(user_id, task_id, completion_date)
```

Damit derselbe Task pro Tag nicht doppelt Punkte gibt.

### hydration_entries

Speichert Wasser-/Hydration-Einträge.

Wichtige Felder:

- `id`
- `user_id`
- `amount_ml`
- `created_at`
- `entry_date`

### pets

Speichert den aktuellen Pet-Zustand pro User.

Wichtige Felder:

- `id`
- `user_id`
- `name`
- `level`
- `growth_progress`
- `growth_goal`
- `available_food_points`
- `happiness`
- `hunger`
- `hearts`
- `meals_served`
- `daily_happiness_gained`
- `happiness_gain_last_reset_at`
- `last_fed_at`
- `last_happiness_decay_at`
- `last_level_up_at`
- `good_care_streak_days`
- `last_good_care_day`
- `created_at`
- `updated_at`

### pet_events

Optional, aber sinnvoll für Nachvollziehbarkeit.

Speichert Aktionen rund um das Pet.

Wichtige Felder:

- `id`
- `user_id`
- `pet_id`
- `event_type`
- `points_delta`
- `growth_delta`
- `happiness_delta`
- `created_at`

Beispiele für `event_type`:

- `TASK_COMPLETED`
- `PET_FED`
- `LEVEL_UP`
- `HYDRATION_ADDED`

## Erste Minimal-Version

Damit Frontend und Datenbank schnell zusammenkommen, reicht als erste Version:

1. `GET /api/users/{userId}/dashboard`
2. `POST /api/users/{userId}/tasks/{taskId}/complete`
3. `POST /api/users/{userId}/hydration`
4. `POST /api/users/{userId}/pet/feed`

Auth kann am Anfang notfalls noch Demo/User-ID-basiert bleiben, wenn Login noch nicht fertig ist.

## Akzeptanzkriterien

- User-Aktionen werden nicht mehr nur lokal im Frontend gespeichert.
- Task-Abschlüsse landen in `user_task_completions`.
- Hydration landet in `hydration_entries`.
- Pet-Fütterungen aktualisieren `pets` und optional `pet_events`.
- `GET /dashboard` liefert den Zustand, den das Angular-Dashboard anzeigen kann.
- Doppelte Task-Abschlüsse am selben Tag erzeugen keine doppelten Punkte.
- Demo-Daten aus `mock-data.ts` können als Seed-Daten in die Datenbank übernommen werden.

## Hinweis Für Die Frontend-Anbindung

Das Frontend soll später den lokalen `AppStateService` umbauen:

Von:

```text
Komponente -> AppStateService -> localStorage
```

Zu:

```text
Komponente -> AppStateService -> HTTP API -> Backend -> PostgreSQL
```

Die Komponenten sollen möglichst gleich bleiben. Nur der Service soll statt lokaler Mock-Logik HTTP-Requests verwenden.
