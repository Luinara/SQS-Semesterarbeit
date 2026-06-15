# PokeHabit Frontend

Angular-Frontend fuer eine Pokemon-inspirierte Game-App: Spieler erledigen Tagesquests, sammeln Punkte, trinken Wasser, trainieren ihr Pokemon und sehen eine Wetter-Szene, die aus echten Wetterdaten abgeleitet wird.

Die UI soll wie eine moderne Game-App wirken. Abgabe- und Technikbegriffe gehoeren nicht in sichtbare Frontend-Texte.

## Schnellstart

Voraussetzungen:

- Node.js und npm
- Spring-Backend auf `http://localhost:8080`
- PostgreSQL fuer das Backend

Start im Frontend-Ordner:

```powershell
cd frontend
npm install
npm start
```

Browser:

```text
http://localhost:4200
```

Der Angular-Dev-Server proxyt `/api` und `/assets` an das Backend:

```text
frontend/proxy.conf.json
```

## Lokale Backend-DB

Im Repo-Root:

```powershell
docker compose up -d db
```

Die Projekt-DB nutzt lokal Host-Port `5433`, damit sie nicht mit anderen Postgres-Containern auf `5432` kollidiert.

Backend-Dev-Config:

```text
jdbc:postgresql://localhost:5433/sqs_db
username: sqs_user
password: sqs_password
```

Backend mit Profil `dev` starten. Der Dev-Seed legt automatisch an:

```text
demo / password123
```

## App-Flow

1. Splash-Screen zeigt den Game-Einstieg.
2. Auth-Screen erlaubt Login oder Registrierung mit Spielername und Passwort.
3. Quest-Board laedt Quests und Spielstand aus dem Backend.
4. Spieler erledigen Quests.
5. Quest-Punkte fuellen Tagesziel und Feed-Punkte.
6. Wasser-Buttons speichern Wasserfortschritt.
7. Pokemon-Training nutzt Feed-Punkte und aktualisiert Level, Wachstum und Motivation.
8. Wetter-Szene passt sich Open-Meteo-Daten und Stadtwahl an.

## Screens und Buttons

### Splash

- `Spiel starten`: fuehrt zur Anmeldung oder bei vorhandener Session direkt ins Spiel.
- Automatische Weiterleitung nach kurzer Ladezeit.

### Login und Registrierung

- `Spielername`: Backend-Username.
- `Passwort`: beim Login nur erforderlich, bei Registrierung mindestens 8 Zeichen.
- `Einloggen und weitermachen`: sendet `POST /api/auth/login`.
- `Profil anlegen und starten`: sendet `POST /api/auth/signup`.

### Topbar

- Spielername und Quest-Fortschritt.
- Feed-Punkte als schnelle Spielstandsanzeige.
- `Neu laden`: laedt den Spielstand erneut aus dem Backend.
- `Abmelden`: sendet `POST /api/auth/logout` und fuehrt zur Auth-Seite.

### Tagesquests

- Jede Quest kommt aus `GET /api/tasks`.
- `Erledigen`: sendet `POST /api/tasks/{id}/complete`.
- Erledigte Quests sind gesperrt und geben keine doppelten Punkte.

### Tagesziel

- Zeigt Quest-Punkte im Verhaeltnis zum Tagesziel.
- `+250 ml` und `+500 ml`: senden `POST /api/user/water`.
- Wasserstand, Energie und Login-Streak kommen aus `GET /api/user/game-state`.

### Pokemon Partner

- Sprite kommt bevorzugt aus dem Backend-Game-State.
- PokeAPI bleibt als Sprite-/Metadaten-Fallback gekapselt.
- `Pokemon trainieren`: sendet `POST /api/user/feed`.
- Wachstum, Motivation und Level werden danach aus dem Backend neu gemappt.

### Wetter-Szene

- Open-Meteo liefert Wettercode, Temperatur und Tag/Nacht.
- `Stadt laden`: sucht Koordinaten per Open-Meteo Geocoding und laedt danach Wetter.
- `Aktualisieren`: laedt Wetter fuer die aktive Stadt neu.
- Szene unterscheidet Sonne, Wolken, Regen, Schnee, Hagel, Sturm, Nebel, Tag und Nacht.

## API-Anbindung

Zentrale Schicht:

```text
src/app/core/services/backend-api.service.ts
```

Aufgaben:

- HTTP mit `fetch`
- `credentials: 'include'` fuer Session-Cookies
- Backend-DTOs in Frontend-Spielmodelle mappen
- Fehlertexte kapseln

Genutzte Endpunkte:

```text
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
GET  /api/tasks
POST /api/tasks/{id}/complete
GET  /api/user/game-state
POST /api/user/water
POST /api/user/feed
```

State-Fassade:

```text
src/app/core/services/app-state.service.ts
```

Aufgaben:

- Aktiver Nutzer
- Spielstand
- Quests
- Pokemon-Zustand
- Wasser/Energie/Streak
- User-Feedback nach Klicks
- Session-Restore fuer Guards

Komponenten rufen nicht direkt `fetch` auf. Sie sprechen ueber Outputs wie `taskCompleted`, `feedRequested`, `waterAdded` mit der State-Fassade.

## Datenfluss

Login:

```text
AuthForm -> AuthPage -> AppStateService.login -> BackendApiService.login
```

Quest erledigen:

```text
TaskCard -> TaskList -> DashboardPage -> AppStateService.completeTask -> BackendApiService.completeTask
```

Pokemon trainieren:

```text
PetCard -> DashboardPage -> AppStateService.feedPet -> BackendApiService.feed
```

Wasser trinken:

```text
Tagesziel-Karte -> DashboardPage -> AppStateService.addWater -> BackendApiService.addWater
```

Wetter:

```text
PetCard -> WeatherService -> OpenMeteoWeatherAdapter -> weather-appearance.logic
```

## Projektstruktur

```text
frontend/
|-- public/
|-- src/
|   |-- app/
|   |   |-- core/
|   |   |   |-- guards/
|   |   |   |-- services/
|   |   |   `-- state/
|   |   |-- pages/
|   |   |   |-- splash/
|   |   |   |-- auth/
|   |   |   `-- dashboard/
|   |   |       `-- components/
|   |   `-- shared/
|   |       |-- models/
|   |       |-- mock/
|   |       `-- ui/
|   |-- styles/
|   |-- main.ts
|   `-- styles.scss
|-- proxy.conf.json
|-- angular.json
|-- package.json
|-- playwright.config.ts
|-- vitest.config.ts
`-- README.md
```

## Tests

Unit-Tests:

```powershell
npm test
```

Typecheck:

```powershell
npm run type-check
```

Lint:

```powershell
npm run lint
```

E2E:

```powershell
npm run test:e2e
```

Coverage:

```powershell
npm run test:coverage
```

## Testmethodik

### Unit

Unit-Tests pruefen reine Logik und Adapter:

- Quest-Punkte
- Tagesziel
- Pokemon-Level und Wachstum
- Wetter-Mapping
- PokeAPI-Fallbacks
- Backend-API-Mapping

### User-Mocking / E2E

Playwright simuliert einen echten Spieler:

- Seite oeffnen
- Spielername und Passwort eintragen
- Login klicken
- Quest-Board sehen
- Quests und Pokemon-Controls pruefen

Die Backend-Routen werden im E2E-Test gemockt, damit der Test reproduzierbar bleibt und nicht an einer lokalen Datenbank haengt.

Auszubauen:

- Registrierung als Spieler
- Quest erledigen und Feedback sehen
- Wasserbutton klicken
- Pokemon trainieren
- Stadt suchen und Wetterwechsel pruefen
- Logout
- Fehlerfall bei nicht erreichbarem Backend

## Clean-Code-Regeln

- Komponenten enthalten UI und Events, aber keine HTTP-Details.
- API-Zugriff bleibt in `BackendApiService`.
- App-State bleibt in `AppStateService`.
- Wetter- und Pokemon-Integrationen bleiben ueber Adapter gekapselt.
- Sichtbare Texte bleiben Game-Sprache: Quest, Spielstand, Pokemon, Training, Tagesziel.
- Legacy-Wording und reine Technikbegriffe werden nicht in der UI angezeigt.
- CSS nutzt vorhandene Tokens und Mixins statt Einmal-Styles.
- Keine neuen grossen Abstraktionen ohne echten Nutzen.

## Cyber-Security-Hardening

Aktueller Frontend-Stand:

- Auth laeuft ueber Backend-Session-Cookie mit `credentials: 'include'`.
- Frontend speichert nur den aktiven Spielernamen fuer Session-Restore.
- Keine Passwoerter im Browser-Speicher.
- Fehlertexte werden fuer Nutzer freundlich gekapselt.

Noch zu pruefen:

- CSRF-Schutz fuer Cookie-basierte POST-Requests.
- Rate-Limiting oder Lockout fuer Login/Signup im Backend.
- Sichere Cookie-Flags in Prod: `HttpOnly`, `Secure`, `SameSite`.
- Keine geheimen Werte in Frontend-Env-Dateien.
- `npm audit` und Dependency-Updates vor Abgabe.
- Security-Tests fuer Auth-Fehler, unauthentifizierte Requests und doppelte Quest-Abschluesse.
- Content Security Policy fuer spaetere Auslieferung.

## Troubleshooting

### `http proxy error: /api/auth/login ECONNREFUSED`

Angular laeuft, aber Backend ist nicht auf `localhost:8080` erreichbar.

Loesung:

1. DB starten: `docker compose up -d db`
2. Backend mit Profil `dev` starten.
3. Frontend auf `http://localhost:4200` neu laden.

### Port `5432` ist belegt

Dieses Projekt nutzt lokal `5433:5432`. Wenn Docker trotzdem meckert, pruefen:

```powershell
docker ps
```

### Login-Daten

Dev-Seed:

```text
demo / password123
```

### Build-Probleme

Erst schnelle Checks:

```powershell
npm run type-check
npm test
npm run lint
```

Falls `ng build` lokal ohne Fehlermeldung abbricht, Node-/Angular-Toolchain pruefen und Build in einer frischen Shell erneut ausfuehren.
