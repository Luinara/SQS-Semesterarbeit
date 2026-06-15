# Quality Requirements

## Qualitätsziele

| Qualitätsmerkmal | Anforderung |
| --- | --- |
| Korrektheit | Login, Registrierung, Quests, Wasser, Training und Logout werden automatisiert geprüft. |
| Wartbarkeit | Backend-Packages folgen Feature-Grenzen; Controller delegieren an Services; HTTP im Frontend bleibt in Services. |
| Testbarkeit | Fachregeln sind in testbare Funktionen und Services ausgelagert. |
| Security | Passwörter werden gehasht, Sessions laufen serverseitig, npm-Abhängigkeiten werden geprüft. |
| Robustheit | Wetter- und Pokemon-Fallbacks verhindern leere UI-Zustände und erlauben Registrierung trotz PokeAPI-Ausfall. |
| Startbarkeit | App und Quality Gate laufen über Docker Compose. |

## Prüfszenarien

| Szenario | Erwartetes Ergebnis |
| --- | --- |
| Quality-Stack wird gestartet | `docker compose --profile quality up --build` startet App-Services und Hub. |
| Pflichtchecks laufen | Backend-Tests, Checkstyle, SpotBugs, Typecheck, Unit-Tests, Coverage, Lint und Security sind grün. |
| Nutzerfluss wird geprüft | Playwright führt die Browser-Reise aus und legt den Report im Hub ab. |
| PokeAPI liefert Fehler | Backend nutzt den lokalen Starter-Katalog und legt den User trotzdem an. |
| Coverage fällt unter den Grenzwert | Der Coverage-Check schlägt fehl und der Hub zeigt das Gate rot. |
| npm-Advisory betrifft das Frontend | `npm run security:frontend` schlägt fehl, bis Lockfile oder Dependency-Tree bereinigt sind. |

## Aktuelle Nachweise

- JaCoCo-Report für das Backend.
- Vitest-Coverage-Report für das Frontend.
- Logs für jeden Gate-Schritt.
- Playwright-HTML-Report.
- Gate-Score mit Pflichtcheck-Zusammenfassung.
