# Querschnittliche Konzepte

## Session und Authentifizierung

Das Backend arbeitet mit serverseitigen Sessions. Das Frontend sendet Requests
mit Credentials, damit das Session-Cookie mitgeht. Passwörter werden nicht im
Browser gespeichert und im Backend gehasht.

## Zustandsverwaltung

Der zentrale Zustand liegt im Angular-Service `AppStateService`. Dort laufen
Nutzer, Tasks, Wasserstand, Pokemon, Feedback und Session-Restore zusammen.
Reine Fachlogik liegt in separaten Funktionen, damit sie ohne Angular-Rendering
getestet werden kann.

## Fehlerbehandlung

Controller liefern HTTP-Statuscodes und kurze Fehlermeldungen. Im Frontend
werden technische Fehler in verständliche UI-Meldungen übersetzt. Wetter- und
Pokemon-Daten haben Fallbacks, damit das Dashboard nicht leer bleibt.

Der Backend-Zugriff auf PokeAPI ist absichtlich defensiv gebaut: kurze
Verbindungs- und Request-Timeouts, keine Pflicht auf echte Netzverfügbarkeit im
Testprofil und ein lokaler Starter-Katalog als Fallback. Wenn PokeAPI beim
Registrieren nicht antwortet, wird der User trotzdem angelegt und die App nutzt
die gepflegten lokalen Starter-Daten.

## Qualitätssicherung

- TypeScript und Java-Compile-Checks prüfen Verträge früh.
- Unit-Tests decken Fachlogik und Services ab.
- Checkstyle, SpotBugs, ESLint und ArchUnit prüfen Wartbarkeit.
- npm audit und Lockfile-Tests prüfen Frontend-Supply-Chain-Risiken.
- Playwright prüft sichtbare Klickwege.
- Der Quality Hub sammelt die Nachweise für die Abgabe.

## Dokumentation

Architektur steht in arc42 und ADRs. API-Verträge liegen unter `docs/API_*.md`.
Der Docker-Start ist in der Root-README und in `quality/README.md` beschrieben.
