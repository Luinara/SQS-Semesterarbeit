# PokeHabit Frontend

Diese README beschreibt unser Frontend fuer PokeHabit. Die App ist keine klassische To-do-Liste, sondern eine kleine Game-App: Man erledigt Tagesquests, sammelt Punkte, trinkt Wasser, trainiert sein Pokemon und bekommt eine Wetter-Szene, die aus echten Wetterdaten kommt.

Wichtig fuer die Abgabe: Im sichtbaren UI soll die App nicht nach Technik-Demo aussehen. Begriffe wie API, Backend oder Abgabe gehoeren nicht auf Buttons und Karten. Technisch ist das Frontend aber sauber an das Spring-Backend angebunden.

## Kurz gesagt

- Angular mit Standalone Components
- SCSS mit globalen Tokens und Component Styles
- Backend-Anbindung ueber einen gekapselten API-Service
- zentraler App-State fuer Spieler, Quests, Wasser, Energie und Pokemon
- Wetter-Szene ueber Open-Meteo
- Pokemon-Sprite aus dem Spielstand, mit Fallback
- Unit-Tests mit Vitest
- User-Flows mit Playwright

## Lokaler Start

### Datenbank starten

Im Repo-Root:

```powershell
docker compose up -d db
```

Unsere Postgres-DB nutzt lokal Host-Port `5433`, damit sie nicht mit anderen Projekten kollidiert, die oft schon `5432` belegen.

```text
Host: localhost
Port: 5433
Database: sqs_db
User: sqs_user
Password: sqs_password
```

### Backend starten

Das Backend muss auf `http://localhost:8181` laufen.

Dev-Profil:

```text
SPRING_PROFILES_ACTIVE=dev
```

Der Dev-Seed legt beim Start automatisch einen Demo-User und Basisquests an:

```text
demo / password123
```

### Frontend starten

```powershell
cd frontend
npm install
npm start
```

Browser:

```text
http://localhost:4200
```

## Warum der Proxy wichtig ist

Angular laeuft lokal auf `localhost:4200`, das Backend auf `localhost:8181`. Damit die Komponenten keine harte Backend-URL kennen muessen, nutzt Angular den Proxy:

```text
frontend/proxy.conf.json
```

Weiterleitungen:

```text
/api    -> http://localhost:8181
/assets -> http://localhost:8181
```

Wenn im Terminal steht:

```text
http proxy error: /api/auth/login ECONNREFUSED
```

dann ist das kein Frontend-Fehler. Das Backend laeuft dann nicht auf Port `8181`.

## App-Flow

1. Spieler oeffnet die App.
2. Splash-Screen fuehrt in das Spiel.
3. Spieler loggt sich ein oder registriert sich.
4. Quest-Board laedt Tagesquests und Spielstand.
5. Spieler erledigt Quests.
6. Punkte fuellen Tagesziel und Feed-Punkte.
7. Spieler kann Wasser speichern.
8. Spieler kann das Pokemon trainieren.
9. Wetter-Szene passt sich an Stadt und Wetterdaten an.

So kann man die Demo gut zeigen: anmelden, klicken, Feedback sehen, Spielstand aktualisiert sich.

## Screens und Buttons

### Splash

Der Splash-Screen ist der Einstieg in die App.

Button:

- `Spiel starten`: fuehrt zum Login oder bei vorhandener Session direkt ins Spiel.

### Login und Registrierung

Der Spieler kommt hier in seinen Spielstand.

Felder:

- `Spielername`: wird als Username fuer das Backend genutzt.
- `Passwort`: beim Login nur erforderlich, bei Registrierung mindestens 8 Zeichen.

Buttons:

- `Einloggen und weitermachen`: meldet den Spieler an.
- `Profil anlegen und starten`: erstellt einen neuen Spieler.

Wichtig: Das Frontend speichert keine Passwoerter im Browser.

### Topbar

Die Topbar gibt schnell Kontext.

Sie zeigt:

- Spielername
- erledigte Quests
- verfuegbare Trainingspunkte

Buttons:

- `Neu laden`: laedt den Spielstand frisch.
- `Abmelden`: beendet die Session und fuehrt zur Login-Seite.

### Tagesquests

Die Quests sind die Hauptmechanik.

Regeln:

- Quests kommen aus dem Backend.
- Eine Quest kann nur einmal abgeschlossen werden.
- Nach Abschluss wird der Spielstand neu geladen.
- Das Backend bleibt die Quelle der Wahrheit.

Button:

- `Erledigen`: schliesst eine Quest ab.

### Tagesziel

Die Tagesziel-Karte zeigt Fortschritt und Ressourcen.

Sie zeigt:

- Quest-Punkte
- Fortschritt in Prozent
- Wasserstand
- Energie
- Login-Streak

Buttons:

- `+250 ml`: speichert Wasser.
- `+500 ml`: speichert Wasser.

### Pokemon Partner

Das Pokemon ist das visuelle Zentrum der App.

Die Karte zeigt:

- Pokemon-Sprite
- Level
- Wachstum
- Motivation
- Trainingspunkte
- Wetter-Szene

Button:

- `Pokemon trainieren`: nutzt Feed-Punkte fuer Training.

Training ist nur aktiv, wenn Punkte vorhanden sind.

### Wetter-Szene

Die Wetter-Szene macht die App lebendiger und weniger statisch.

Open-Meteo liefert:

- Temperatur
- Wettercode
- Tag oder Nacht

Daraus baut das Frontend eine Szene fuer:

- Sonne
- Wolken
- Regen
- Schnee
- Hagel
- Sturm
- Nebel
- Tag/Nacht-Stimmung

Buttons:

- `Stadt laden`: sucht eine Stadt und laedt das passende Wetter.
- `Aktualisieren`: laedt das Wetter fuer die aktuelle Stadt neu.

## API-Anbindung

Komponenten rufen nicht direkt `fetch` auf. Dafuer gibt es eine eigene Schicht:

```text
src/app/core/services/backend-api.service.ts
```

Diese Schicht macht:

- Requests ans Backend
- Session-Cookies mitsenden
- Backend-DTOs in Frontend-Modelle mappen
- Fehlertexte kapseln

Genutzte Endpunkte:

```text
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
DELETE /api/user/account
GET  /api/tasks
POST /api/tasks/{id}/complete
GET  /api/user/game-state
POST /api/user/water
POST /api/user/feed
```

Der App-State liegt hier:

```text
src/app/core/services/app-state.service.ts
```

Er verbindet:

- aktiven Spieler
- Quests
- Pokemon-Zustand
- Wasser und Energie
- Feedback-Meldungen
- Session-Restore fuer Guards

Kurz gesagt: Komponenten sollen nicht wissen muessen, wie genau das Backend antwortet.

## Datenfluss

Login:

```text
AuthForm -> AuthPage -> AppStateService.login -> BackendApiService.login
```

Quest erledigen:

```text
TaskCard -> TaskList -> DashboardPage -> AppStateService.completeTask -> BackendApiService.completeTask
```

Wasser trinken:

```text
Tagesziel-Karte -> DashboardPage -> AppStateService.addWater -> BackendApiService.addWater
```

Pokemon trainieren:

```text
PetCard -> DashboardPage -> AppStateService.feedPet -> BackendApiService.feed
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

## Teststrategie

Wir testen nicht nur einzelne Funktionen, sondern auch echte Klickwege.

### Unit-Tests

Unit-Tests pruefen:

- Punkteberechnung
- Tagesziel
- Pokemon-Level und Wachstum
- Wetter-Mapping
- Pokemon-Fallbacks
- API-Mapping im Frontend

Befehl:

```powershell
npm test
```

### Typecheck

```powershell
npm run type-check
```

### Lint

```powershell
npm run lint
```

### E2E / User-Mocking

Playwright simuliert einen echten Spieler.

Aktuell wichtig:

- Seite oeffnen
- Login ausfuellen
- Button klicken
- Quest-Board sehen
- Pokemon-Controls pruefen

Befehl:

```powershell
npm run test:e2e
```

Noch auszubauen:

- Registrierung
- Quest erledigen
- Wasserbutton klicken
- Pokemon trainieren
- Stadt suchen
- Wetter aktualisieren
- Logout
- Fehlerfall bei nicht erreichbarem Backend

## Clean-Code-Methodik

Unser Ziel ist, dass die App nicht nur laeuft, sondern nachvollziehbar gebaut ist.

Regeln:

- Komponenten bleiben fuer UI und Events zustaendig.
- HTTP bleibt im API-Service.
- Spielstand bleibt im State-Service.
- Wetter und Pokemon sind ueber Adapter gekapselt.
- Sichtbare Texte bleiben Game-Sprache.
- Alte Mock-/Legacy-Begriffe werden nicht in der UI gezeigt.
- Mapping-Logik wird nicht wild in Komponenten verteilt.
- Styles nutzen vorhandene Tokens und Mixins.

## Cyber-Security-Hardening

Aktueller Stand:

- Session-Cookies werden ueber `credentials: 'include'` genutzt.
- Das Frontend speichert keine Passwoerter.
- Nur der aktive Spielername wird fuer Session-Restore lokal gespeichert.
- Fehlertexte werden fuer Spieler verstaendlich gekapselt.

Noch offen fuer die Abgabe:

- CSRF-Schutz fuer cookie-basierte POST-Requests klaeren.
- Rate-Limiting oder Lockout fuer Login und Signup pruefen.
- Produktiv-Cookie-Flags pruefen: `HttpOnly`, `Secure`, `SameSite`.
- Keine Secrets im Frontend.
- `npm audit` ausfuehren.
- Security-Tests fuer unauthentifizierte Requests und doppelte Quest-Abschluesse ergaenzen.
- Content Security Policy fuer Deployment pruefen.

## Checks vor Abgabe

Mindestens:

```powershell
npm run type-check
npm test
npm run lint
```

Wenn moeglich:

```powershell
npm run test:e2e
npm run build
```

## Troubleshooting

### Proxy-Fehler beim Login

Fehler:

```text
http proxy error: /api/auth/login ECONNREFUSED
```

Bedeutung:

- Frontend laeuft.
- Backend laeuft nicht auf `localhost:8181`.

Loesung:

```powershell
docker compose up -d db
```

Dann Backend mit Profil `dev` starten.

### Port-Konflikt bei Postgres

Dieses Projekt nutzt:

```text
5433:5432
```

Wenn Docker trotzdem meckert:

```powershell
docker ps
```

### Demo-Login

```text
demo / password123
```

## Was als Naechstes wichtig ist

- Mehr User-Flow-Tests schreiben.
- Doku rechtschreibpruefen.
- Security-Hardening sauber dokumentieren.
- UI weiter auf moderne Pokemon-/Game-App trimmen.
- Legacy-Wording konsequent aus sichtbaren Stellen entfernen.
