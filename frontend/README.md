# SQS Frontend

Minimal Viable Product einer pet-basierten Productivity-Web-App auf Basis von Angular, TypeScript, SCSS und Standalone Components.

## Schnellstart Schritt fuer Schritt

1. In den Frontend-Ordner wechseln:

```bash
cd frontend
```

2. Wenn du alles in einem Schritt ausfuehren willst, nutze das Setup-Skript:

PowerShell unter Windows:

```powershell
PowerShell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

Git Bash / Linux / macOS:

```bash
bash ./scripts/setup.sh
```

3. Falls du lieber manuell vorgehst, installiere die Abhaengigkeiten:

```bash
npm install
```

4. Entwicklungsserver starten:

```bash
npm start
```

5. Im Browser oeffnen:

```text
http://localhost:4200
```

6. App-Flow durchgehen:

- Splash-Screen ansehen
- Weiter zum Login oder automatisch weiterleiten lassen
- Mit dem Demo-Konto anmelden oder lokal registrieren
- Tasks erledigen, Punkte sammeln und das Pet fuettern

7. Entwicklungsserver beenden:

```bash
Strg + C
```

## Installation

Komplett automatisiert per Skript:

PowerShell:

```powershell
PowerShell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

Bash:

```bash
bash ./scripts/setup.sh
```

Oder manuell:

```bash
npm install
```

## Projekt starten

```bash
npm start
```

Die Anwendung laeuft standardmaessig ueber Angular CLI im Entwicklungsmodus und ist in der Regel unter `http://localhost:4200` erreichbar.

## Produktions-Build

```bash
npm run build
```

## Type-Check

```bash
npm run type-check
```

## Tests

Unit-Tests mit Coverage:

```bash
npm run test:coverage
```

E2E-Test mit Playwright:

```bash
npm run test:e2e
```

Code-Qualitaet pruefen:

```bash
npm run lint
npm run format:check
```

## Was das Setup-Skript macht

Das Skript fuehrt nacheinander folgende Schritte aus:

1. `npm install`
2. `npm run type-check`
3. `npm run build`

Damit wird nicht nur installiert, sondern direkt geprueft, ob das Frontend in deinem lokalen Zustand sauber kompiliert.

Die eigentlichen Testbefehle bleiben bewusst separat, damit man bei Bedarf schneller nur Build oder nur Tests laufen lassen kann.

## Demo-Zugang

- E-Mail: `demo@sqs.app`
- Passwort: `cozyfocus`

Alternativ kann auf dem Auth-Screen ein lokales Demo-Profil registriert werden.

## Typischer Nutzungsablauf

1. Splash-Screen oeffnen
2. Zum Auth-Screen wechseln
3. Mit Demo-Account einloggen oder neues lokales Profil anlegen
4. Aufgaben links abschliessen
5. Futterpunkte sammeln
6. Rechts das Pet fuettern und Level-Fortschritt beobachten

## Projektstruktur

```text
frontend/
|-- public/
|   |-- favicon.svg
|   `-- pet-placeholder.svg
|-- src/
|   |-- app/
|   |   |-- core/
|   |   |   |-- guards/
|   |   |   `-- services/
|   |   |-- pages/
|   |   |   |-- splash/
|   |   |   |-- auth/
|   |   |   |   `-- auth-form/
|   |   |   `-- dashboard/
|   |   |       `-- components/
|   |   `-- shared/
|   |       |-- mock/
|   |       |-- models/
|   |       `-- ui/
|   |-- styles/
|   |   |-- _mixins.scss
|   |   `-- _tokens.scss
|   |-- main.ts
|   `-- styles.scss
|-- angular.json
|-- package.json
|-- scripts/
|   |-- setup.ps1
|   `-- setup.sh
|-- testing/
|   `-- playwright-test.ts
|-- tsconfig.json
|-- tsconfig.app.json
|-- vitest.config.ts
`-- playwright.config.ts
```

## Mock-State-Verwaltung

Die gesamte Demo-Logik liegt in `src/app/core/services/app-state.service.ts`.

- Der Service verwaltet Login/Register, aktive Session, Task-Fortschritt, Punkte und Pet-Wachstum.
- Persistiert wird die komplette Mock-Anwendung im `localStorage`.
- Der verwendete Speicher-Key ist in `src/app/shared/mock/mock-data.ts` als `STORAGE_KEY` definiert.
- Initiale Demo-Daten fuer Tasks, Pet und Demo-Account kommen ebenfalls aus `src/app/shared/mock/mock-data.ts`.
- `browser-storage.service.ts` kapselt den direkten Zugriff auf den Browser-Speicher, damit die Fachlogik im State-Service lesbar bleibt.

## Wo spaeter echte Daten angeschlossen werden koennen

- Login/Register: `src/app/core/services/app-state.service.ts`
- Initiale Mock-Daten: `src/app/shared/mock/mock-data.ts`
- Route-Schutz: `src/app/core/guards/`

Die aktuelle Struktur ist bewusst so geschnitten, dass spaeter API-Calls oder ein echtes Backend hinzugefuegt werden koennen, ohne die Komponenten zu einer God-Architektur aufzublaehen.

## Pet-Platzhalter austauschen

Die Platzhaltergrafik liegt in:

`public/pet-placeholder.svg`

Sie wird zentral durch die Komponente `src/app/pages/dashboard/components/pet-visual/` eingebunden.
Dadurch kann spaeter ein Sprite, ein PNG oder eine neue SVG-Datei ersetzt werden, ohne die Dashboard-Logik anpassen zu muessen.

## Wichtige Screens

- Splash-Screen mit automatischer Weiterleitung und manueller CTA
- Login/Register mit lokaler Frontend-Validierung
- Dashboard mit Task-Sidebar, Pet-Karte, Fortschrittslogik und Reset-Funktion

## Verwendete Kernideen

- Angular Routing mit Standalone Components
- lokale Persistenz ueber `localStorage`
- keine API-Calls, kein Backend-Zwang, keine externe State-Library
- klares Design-System ueber globale SCSS-Tokens und Mixins
- reine Fachlogik aus dem State-Service in testbare Funktionen ausgelagert

## Wenn etwas nicht startet

1. Sicherstellen, dass der Befehl im Ordner `frontend` ausgefuehrt wird.
2. Fuer einen kompletten Neuaufbau kannst du direkt das Setup-Skript verwenden:

PowerShell:

```powershell
PowerShell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

Bash:

```bash
bash ./scripts/setup.sh
```

3. Falls du lieber manuell vorgehst, fuehre erneut aus:

```bash
npm install
```

4. Danach den Dev-Server erneut starten:

```bash
npm start
```

5. Falls alte Demo-Daten stoeren, im Browser den `localStorage` fuer `localhost:4200` loeschen oder im Dashboard die Reset-Funktion verwenden.
