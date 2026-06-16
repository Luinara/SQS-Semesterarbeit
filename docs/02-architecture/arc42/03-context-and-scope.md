# Kontext und Abgrenzung

PokeHabit ist die App, die wir für die SQS-Semesterarbeit gebaut haben. Im
Kern geht es um tägliche Quests, Wassertracking und einen Pokémon-Partner, der
durch erledigte Aufgaben Fortschritt bekommt. Zum System zählen das Angular-
Frontend, das Spring-Boot-Backend, PostgreSQL und der Quality Hub, den wir für
die lokale Abgabeprüfung ergänzt haben.

## Fachlicher Kontext

| Nachbar | Beziehung |
| --- | --- |
| Nutzer | Nutzt die Browseroberfläche für Login, Registrierung, Quests, Wasser, Training, Wetter und Account-Löschung. |
| Open-Meteo | Liefert Wetterdaten für die Szene im Dashboard. |
| PokeAPI / Pokémon-Bilder | Liefert Pokémon-Daten und Bildquellen für den Partner. |
| SQS-Bewertung | Prüft den Stand über Doku, Docker-Start, Tests und Quality Hub. |

## Technischer Kontext

| Schnittstelle | Beschreibung |
| --- | --- |
| Browser -> Frontend | Lädt die Angular-App, in Docker über Nginx. |
| Frontend -> Backend | Ruft `/api/auth`, `/api/tasks` und `/api/user` mit Session-Cookie auf. |
| Backend -> PostgreSQL | Speichert Nutzer, Tasks, Fortschritt, Wasserstand, Streak, Starter und Pokémon-Zustand. |
| Backend -> PokeAPI | Holt beim Registrieren Name und Artwork der Starter-Pokémon; bei Fehlern greift der lokale Starter-Katalog. |
| Quality Runner -> Projekt | Führt Maven-, npm-, Vitest-, ESLint-, SpotBugs-, Checkstyle-, npm-audit- und Playwright-Checks aus. |
| Quality Hub -> Quality output | Liest `report.json`, Logs und Reports aus dem Docker-Volume. |

## Nicht im Scope

- Öffentliches Produktivhosting mit Domain und TLS.
- Externer Login-Anbieter.
- Vollständige Tageshistorie mit append-only Task-Completions.
