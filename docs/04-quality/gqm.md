# Qualitätsmodell nach GQM

PokeHabit ist keine Banking-Anwendung und kein sicherheitskritisches
Medizinsystem, sondern eine Self-Care- und Habit-Tracking-App mit
Gamification. Deshalb liegt der Qualitätsschwerpunkt nicht nur auf technischer
Korrektheit, sondern auch auf zuverlässigen Nutzerflüssen, geschützten
Nutzerdaten, wartbarer Architektur und reproduzierbarem Betrieb.

Wir verwenden GQM, um die Qualitätsziele des Projekts explizit mit konkreten
Fragen und messbaren Nachweisen zu verbinden.

| Goal | Question | Metric / Nachweis |
| --- | --- | --- |
| Analysiere die Backend-API zum Zweck der Zuverlässigkeit aus Sicht der Nutzer im Kontext der Self-Care-App. | Funktionieren Registrierung, Login, Logout, Tasks und Pokémon-Fortschritt stabil? | Backend-Unit-, Controller- und Integrationstests grün; zentrale API-Flows durch `AuthenticationControllerIntegrationTest`, `TaskControllerTest`, `UserControllerTest` und Game-State-Tests abgedeckt. |
| Analysiere die UI zum Zweck der Benutzbarkeit aus Sicht der Nutzer. | Kann ein Nutzer ohne manuelle Anleitung zentrale Aktionen ausführen? | Playwright-E2E-Flows für Registrierung/Login, Dashboard, Wasser, Quest, Level-Up, Logout, Daily Reset und Starter-Entwicklung grün. |
| Analysiere die Architektur zum Zweck der Wartbarkeit aus Sicht der Entwickler. | Bleiben Controller, Services und Repositories sauber getrennt? | ArchUnit-Regeln grün; Architekturtests verhindern direkte Zugriffe über Schichtgrenzen hinweg. |
| Analysiere die Security zum Zweck der Vertraulichkeit aus Sicht der Nutzer. | Sind private User-, Task- und Fortschrittsdaten geschützt? | Geschützte Endpoints liefern ohne gültige Session 401/403; Security-nahe Controller-Tests grün; Frontend-Abhängigkeiten werden per `npm audit` geprüft. |
| Analysiere externe Abhängigkeiten zum Zweck der Robustheit aus Sicht der Nutzer. | Funktioniert die App nachvollziehbar, auch wenn externe APIs nicht direkt im Test kontaktiert werden? | PokeAPI- und Wetter-Service-Tests verwenden kontrollierte Testdaten bzw. Mock-Server; manueller Wetter-API-Nachweis dokumentiert echte Open-Meteo-Felder. |
| Analysiere das Deployment zum Zweck der Portabilität aus Sicht des Dozenten. | Läuft das Projekt auf einem fremden Rechner reproduzierbar? | Frischer Clone, Setup-Skript, Docker Compose und Quality Hub ausführbar; Quality Runner sammelt Backend-, Frontend-, Security-, Lint- und Coverage-Nachweise. |

## Verbindung zur Testpyramide

Das GQM-Modell definiert, welche Qualitätsfragen für PokeHabit relevant sind.
Die Testpyramide beschreibt anschließend, mit welchen Testarten diese Fragen
praktisch geprüft werden. Damit ist die Testpyramide kein Selbstzweck, sondern
die konkrete Umsetzung der zuvor definierten Qualitätsziele.