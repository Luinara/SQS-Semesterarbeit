# SQS Agent TODOs

## Aktueller Umbau: Frontend auf echte Backend-API

- [x] Backend-API-Dokumente und Controller lesen.
- [x] Merge von `origin/main` in `Zill` bestätigt.
- [x] API-DTOs aus Backend exakt auf Frontend-Modelle mappen.
- [x] `AppStateService` von localStorage-Mock auf HTTP + Session-Cookies umbauen.
- [x] Auth-Form auf Backend-Username statt Demo-E-Mail ausrichten.
- [x] Taskliste, Wasser, Feed und Pokemon-Anzeige aus `/api/user/game-state` rendern.
- [x] Task completion über `POST /api/tasks/{id}/complete` ausführen.
- [x] Wasser über `POST /api/user/water` ausführen.
- [x] Pokemon training/feed ueber `POST /api/user/feed` ausführen.
- [x] Offline/Demo-Fallback nur als Fehlerzustand behalten, nicht als Standardlogik.
- [x] Backend `GameStateDto.tasks` mit echten `user_tasks`-Completion-Daten befuellen.
- [x] Unit- und E2E-Tests auf API-Service/HTTP-Mapping aktualisieren.
- [x] Frontend-Checks ausführen.
- [x] Register-Formular vereinfacht: Backend braucht nur `username` und `password`, kein zweites Profilnamenfeld.
- [x] Login erlaubt Seed-Passwort `test123`; Mindestlänge 8 gilt nur für Registrierung.
- [x] Backend-Signup robust gemacht: random Pokemon wird nur gesetzt, wenn Pokemon-Daten in der DB vorhanden sind.
- [x] `application-dev.properties` an lokale Docker-Compose-DB angeglichen.
- [x] Dev-Seed eingebaut: Profil `dev` legt `demo` / `password123` und Basis-Tasks beim Backend-Start an.
- [x] Sichtbare Frontend-Texte von SQS/Quality/API/Backend-Wording auf PokeHabit/Game/Quest-Sprache umgestellt.
- [x] Alte Root-README als Legacy-Doku nach `frontend/docs/legacy-project-readme.md` verschoben.
- [ ] Backend-Compile ausführen, sobald Maven oder ein Maven-Wrapper verfügbar ist.
- [ ] Angular Production-Build erneut prüfen; lokaler Build bricht aktuell ohne Diagnose nach "Building..." ab.
- [ ] E2E erneut prüfen; aktueller Lauf hing beim lokalen Playwright-Dev-Server-Start.

## Naechste Abgabe-TODOs

- [ ] Ausführliche Frontend-Dokumentation finalisieren: Architektur, API-Anbindung, Screens, Buttons, Datenfluss, Fehlermodi.
- [ ] Frontend-README aktuell halten und als zentrale Frontend-Doku nutzen, damit UI/API-Doku nicht im Repo verstreut ist.
- [ ] Rechtschreibpruefung für sichtbare UI-Texte, README, Abgabedoku und Testnamen durchfuehren.
- [ ] User-Mocking-/Interaction-Tests ausbauen: Login, Registrierung, Quest erledigen, Wasser trinken, Pokemon trainieren, Stadt suchen, Wetter refresh, Logout, Fehlerzustände.
- [ ] Test-Coverage stärken: `BackendApiService`, `AppStateService`, Auth-Form, Task-/Quest-Komponenten, Pokemon-/Wetter-Fallbacks, Guards.
- [ ] Playwright-Tests als echte Nutzerreise dokumentieren: Nutzer klickt Buttons, sieht Feedback, Spielstand wird aktualisiert.
- [ ] Legacy-Wording und alte Mock-Begriffe entfernen oder intern sauber kapseln: Quality/SQS/Backend-Texte duerfen im sichtbaren UI nicht auftauchen.
- [ ] UI modern und Pokemon-artig weiterpolieren: Quest-Board, Wetter-Szene, Sprite-Fokus, klare Progress-/Training-States.
- [ ] Clean-Code-Audit: kleine Komponenten, keine God-Components, sprechende Adapter/Services, keine duplizierte Mapping-Logik.
- [ ] Cyber-Security-Hardening pruefen: Session-Cookies, CSRF-Strategie, Input-Validierung, Rate-Limiting/Lockout, sichere Fehlertexte, npm audit, Dependency-Updates.
- [ ] API-Dokumentation ergänzen: Endpunkte, Payloads, Statuscodes, Fallbacks und wie das Frontend die Responses mappt.
- [ ] Deployment-/Start-Doku prüfen: Docker DB auf Host-Port `5433`, Backend `dev` Profil, Angular Proxy auf `localhost:8080`.

## API-Notizen

- Auth:
  - `POST /api/auth/login` mit `{ "username": "...", "password": "..." }`
  - `POST /api/auth/signup` mit `{ "username": "...", "password": "..." }`
  - `POST /api/auth/logout`
- Game-State:
  - `GET /api/user/game-state`
  - Felder: `waterLevel`, `foodLevel`, `pokemonImageUrl`, `pokemonLevel`, `growth`, `happiness`, `pendingFeedPoints`, `tasks`, `streak`, `yesterdayLoggedIn`, `serverNow`
- Tasks:
  - `GET /api/tasks`
  - `POST /api/tasks/{id}/complete`
- Wasser/Füttern:
  - `POST /api/user/water` mit `{ "ml": 250 }`
  - `POST /api/user/feed`
- Lokale Dev-Integration:
  - Angular-Proxy für `/api -> http://localhost:8080`
  - Backend-Dev-Cookie darf nicht `secure=true` sein, sonst keine HTTP-Session lokal.
