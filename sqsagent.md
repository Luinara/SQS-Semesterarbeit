# SQS Agent TODOs

## Arbeitsregeln

- Sichtbare deutsche UI-Texte und Doku immer auf echte Umlaute prüfen: `ä`, `ö`, `ü`, `Ä`, `Ö`, `Ü`, `ß`.
- Ersatzschreibweisen wie `ae`, `oe`, `ue` nur für technische IDs, Dateinamen, Slugs oder bewusst ASCII-only Kontexte verwenden.

## Erledigt

- [x] Frontend auf echte Backend-API umgestellt.
- [x] Auth nutzt Backend-Spielernamen und Session-Cookies.
- [x] Quests, Wasser, Feed und Pokémon-State werden aus der API geladen.
- [x] Wetter-Hintergrund bleibt aus Open-Meteo-Daten abgeleitet.
- [x] Sichtbare UI-Texte auf Game-App/PokeHabit statt SQS-/Quality-Wording umgestellt.
- [x] Dev-Seed für `demo / password123` eingebaut.
- [x] Docker-DB auf Host-Port `5433` umgestellt, weil `5432` lokal belegt war.
- [x] Alte Root-README nach `frontend/docs/legacy-project-readme.md` verschoben.
- [x] Frontend-README auf Deutsch in realistischem Business-/Abgabe-Ton neu geschrieben.
- [x] Guard-Tests für Auth-/Guest-Routing ergänzt.
- [x] E2E-Test als echte Nutzerreise formuliert: Login, Wasser, Quest, Training, Logout.

## Nächste Abgabe-TODOs

- [x] Frontend-Doku rechtschreibprüfen und fachlich gegen die echte App gegenlesen.
- [x] API-Doku ergänzen: Endpunkte, Payloads, Statuscodes, Fehlerfälle, Mapping ins Frontend.
- [x] User-Mocking-/Interaction-Tests ausbauen:
  - [x] Login
  - [x] Registrierung
  - [x] Quest erledigen
  - [x] Wasser trinken
  - [x] Pokémon trainieren
  - [x] Stadt suchen
  - [x] Wetter aktualisieren
  - [x] Logout
  - [x] Fehlerfall bei nicht erreichbarem Backend
- [x] Test-Coverage stärken:
  - [x] `BackendApiService`
  - [x] `AppStateService`
  - [x] Auth-Form
  - [x] Quest-Komponenten
  - [x] Pokémon-Fallback
  - [x] Wetter-Fallback
  - [x] Guards
- [x] E2E-Tests als echte Nutzerreise formulieren: Nutzer klickt Buttons und sieht Feedback.
- [x] UI weiter modern und Pokémon-artig polieren:
  - [x] Quest-Board
  - [x] Pokémon-Fokus
  - [x] Wetter-Szene
  - [x] Training-Feedback
  - [x] Level-Up-Zustand
- [x] Legacy-Wording aus sichtbaren Stellen entfernen.
- [x] Clean-Code-Audit machen:
  - [x] keine HTTP-Logik in Komponenten
  - [x] keine doppelten Mapper
  - [x] Services klein und klar halten
  - [x] Komponenten nicht zu God-Components werden lassen
- [x] Cyber-Security-Hardening prüfen:
  - [x] CSRF bei Cookie-Session geprüft: SameSite-Cookie, Session-Rotation und kurze Session-Laufzeit aktiv
  - [x] Rate-Limiting/Lockout für Login
  - [x] sichere Cookie-Flags in Prod
  - [x] keine Secrets im Frontend
  - [x] sichere Fehlertexte
  - [x] unauthentifizierte Requests testen
  - [x] doppelte Quest-Abschlüsse testen
  - [x] `npm audit`
- [x] Backend-Compile über Docker/Maven ausgeführt.
- [x] Angular Production-Build erneut geprüft: `npm run build` läuft nach Angular-21-Security-Patchupgrade grün.
- [x] Playwright-E2E erneut geprüft: Nutzerreise läuft grün mit manuell gehaltenem Dev-Server und `PLAYWRIGHT_SKIP_WEB_SERVER=1`.

## PDF-Checkliste / harte Abgabe-Risiken

- [x] Projekt ist als Web-App mit Frontend, Backend und Persistenz aufgebaut.
- [x] Es gibt öffentliche Endpunkte, z. B. `GET /api/tasks`.
- [x] Es gibt gesicherte Endpunkte mit Session-Cookie, z. B. User-Game-State und Logout.
- [x] Unit-, Integrations-, Architektur- und E2E-Tests sind vorhanden.
- [x] Quality Hub läuft per Docker Compose und zeigt Tests, Coverage, Lint, Security und E2E sichtbar an.
- [x] arc42-Doku und ADRs sind im Repository gepflegt.
- [x] Backend spricht aktiv mit einem externen Service: PokeAPI-Client für Starter-Pokémon mit Timeout und Fallback.
- [x] Ausfall des externen Service ist getestet und in arc42/ADR nachvollziehbar dokumentiert.
- [x] C4-Nachweis mit Structurizr ergänzt: `docs/02-architecture/diagrams/structurizr/workspace.dsl`.
- [x] ReadTheDocs-Konfiguration im Repository ergänzt: `.readthedocs.yaml`, `mkdocs.yml`, `docs/index.md`, `docs/requirements.txt`.
- [ ] Öffentliches Repository bei ReadTheDocs verbinden und veröffentlichte Doku-URL in README/Präsentation ergänzen.
- [x] Präsentationsablauf vorbereitet: `docs/05-presentation/presentation-plan.md` mit 15-Minuten-Demo, Quality Hub, C4, Testkonzept und Q&A.
- [x] Präsentations-Sprechzettel ergänzt: `docs/05-presentation/presentation-cheat-sheet.md` klingt direkter und weniger nach generischer Folie.
- [x] Testpyramide als eigener SQS-Nachweis dokumentiert: `docs/04-quality/test-pyramid.md`, inklusive Unit, Integration, Security, Architektur, Coverage und E2E.
- [x] Finale Doku gegen generische KI-Sprache lesen: konkrete Projektdetails statt austauschbarer Füllsätze.

## Implementierungs-Polish mit hoher Abgabe-Wirkung

Nicht wild neue Features bauen. Ziel: kleine Änderungen, wenig Risiko, viel
SQS-/Demo-Wirkung.

- [x] PokeAPI-Logik leicht verbessern:
  - [x] PokeAPI nur aufrufen, wenn das Pokemon noch nicht in der DB liegt.
  - [x] vorhandene Starter-Daten nicht unnötig überschreiben; lokale Evolutionsdaten werden bei Bedarf ergänzt.
  - [x] optional kleinen In-Memory-Cache für Starter-Pokemon geprüft: nicht nötig, weil DB-Reuse die externen Calls reduziert.
  - [x] Test ergänzt: vorhandene Pokemon werden wiederverwendet und lösen keinen externen API-Call aus.
- [x] Demo-UX im Frontend polieren:
  - [x] Login/Registrierung mit sauberem Ladezustand.
  - [x] nach Quest, Wasser und Training klares Feedback anzeigen.
  - [x] Fehlerzustand bei nicht erreichbarem Backend menschlicher formulieren.
  - [x] Dashboard darf beim Laden nicht leer oder nervös wirken.
- [x] E2E-Demo stabiler machen:
  - [x] Playwright-Flow exakt an Präsentationsreise halten: Login, Quest, Wasser, Training, Logout.
  - [x] sicherstellen, dass der Quality Hub den E2E-Report gut sichtbar verlinkt.
  - [x] optional Screenshot/Trace im Report für die Demo prüfen.
- [x] Demo-Daten robuster machen:
  - [x] sicherstellen, dass `demo / password123` beim Docker-Start zuverlässig existiert.
  - [x] Demo wird beim Dev-Backend-Start auf einen präsentierbaren Zustand zurückgesetzt.
  - [x] Tests ergänzen: Dev-Seeder setzt Passwort, Starter, Wasser, XP, Feed-Punkte und Task-Status stabil.
- [x] Kleine UI-Reife-Details:
  - [x] Buttons während laufender Requests deaktivieren.
  - [x] doppelte Klicks bei Quest/Training vermeiden.
  - [x] mobile Layout einmal prüfen.
  - [x] sichtbare englische Resttexte suchen und bei Bedarf eindeutschen.

Nicht mehr anfangen:

- [ ] keine großen neuen Features.
- [ ] kein neues Auth-System.
- [ ] kein komplettes UI-Redesign.
- [ ] kein großer Datenmodell-Umbau.
- [ ] kein lokales SonarQube nachrüsten, solange der Quality Hub sauber läuft.

## Lokale Startnotizen

- Docker-DB:
  - Host-Port: `5433`
  - Container-Port: `5432`
  - DB: `sqs_db`
  - User: `sqs_user`
  - Passwort: `sqs_password`
- Backend:
  - URL: `http://localhost:8181`
  - Profil: `dev`
- Frontend:
  - URL: `http://localhost:4200`
  - Proxy: `/api` und `/assets` gehen auf `localhost:8181`
- Demo-Login:
  - `demo / password123`
