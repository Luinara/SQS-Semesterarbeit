# Bausteinsicht

PokeHabit ist in fünf große Bausteine getrennt: Angular-Frontend,
Spring-Boot-Backend, PostgreSQL-Datenbank, externe Dienste und Quality Hub.
Die Trennung ist für die Abgabe wichtig, weil App-Funktion, externe Services,
Persistenz und Qualitätssicherung getrennt gezeigt und getestet werden können.

Die Angular-Komponenten sind zusätzlich in
[Frontend-Komponentenarchitektur](frontend-component-architecture.md)
dokumentiert.

## Ebene 1 - Systemüberblick

| Baustein             | Verantwortung                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Angular-Frontend     | Oberfläche für Splash, Login, Registrierung, Dashboard, Quests, Wasser, Pokémon-Fortschritt und Wetter-Szene.             |
| Backend-API          | REST-API für Authentifizierung, Tasks, Spielstand, Wassertracking, Account-Löschung und Persistenzzugriff.                |
| PostgreSQL-Datenbank | Speichert Nutzer, Tasks, Taskstatus, Spielstand und Pokémon-Fortschritt.                                                  |
| PokeAPI              | Externer Dienst für Starter-Pokémon und Evolutionsdaten; bei Ausfall greift das Backend auf lokale Fallback-Daten zurück. |
| Open-Meteo           | Externer Wetterdienst für die Wetterdaten der Dashboard-Szene; wird über das Frontend angebunden.                         |
| Quality Hub          | Dockerisiertes Dashboard mit Runner für Tests, Coverage, Lint, statische Analyse, Security und E2E-Reports.               |

## Ebene 2 - Frontend

| Baustein              | Verantwortung                                                             |
| --------------------- | ------------------------------------------------------------------------- |
| Routes und Guards     | Routen definieren und Zugriff auf Auth-/Dashboard-Seiten steuern.         |
| Pages                 | Vollständige Ansichten wie Splash, Auth und Dashboard zusammensetzen.     |
| Dashboard-Komponenten | Tasks, Wasserstand, Pokémon-Karte, Wetter, Topbar und Tagesziel anzeigen. |
| Shared UI             | Wiederverwendbare Elemente wie Buttons, Progress Bars und Stat Badges.    |
| Core Services         | Zustand, Backend-API, Pokémon-Daten und Wetterdaten kapseln.              |
| Shared Models         | TypeScript-Verträge für API-Mapping und UI-Zustand bereitstellen.         |

## Ebene 2 - Backend

| Baustein                  | Verantwortung                                                                |
| ------------------------- | ---------------------------------------------------------------------------- |
| Authentication            | Registrierung, Login, Session-Erzeugung und Demo-Seed.                       |
| Quest- und Nutzeraktionen | Questabschluss, Wassertracking und Test-Level-Up.                            |
| User Game State           | Bereitstellung des aktuellen Spielstands für das Dashboard.                  |
| Pokémon-Integration       | PokeAPI-Aufruf, Timeout, Fallback und Wiederverwendung vorhandener DB-Daten. |
| Persistence               | Repositories und Entities für Nutzer, Tasks, Spielstand und Pokémon-Daten.   |

## Architekturzuordnung im Backend

Die folgende Zuordnung beschreibt die wichtigsten Backend-Bausteine und ihre Rolle im Architekturansatz.

| Bereich             | Rolle in der Architektur                 | Beispiele                                         |
| ------------------- | ---------------------------------------- | ------------------------------------------------- |
| REST-Controller     | Primäre Adapter                          | AuthController, TaskController, PokemonController |
| Services            | Anwendungskern / fachliche Logik         | UserService, TaskService, PokemonService          |
| Repositories        | Sekundäre Adapter für Persistenz         | UserRepository, TaskRepository, PokemonRepository |
| Externe API-Clients | Sekundäre Adapter für Fremdsysteme       | PokeAPI-Client                                    |
| Datenbank           | Externes Persistenzsystem                | PostgreSQL                                        |
| Externe Dienste     | Externe Fremdsysteme                     | PokeAPI, Open-Meteo                               |
| Quality Hub         | Querschnittlicher Unterstützungsbaustein | Unit-, Integration-, E2E- und Coverage-Reports    |

## Ebene 2 - Quality Hub

| Baustein       | Verantwortung                                                              |
| -------------- | -------------------------------------------------------------------------- |
| Quality Runner | Führt Maven-, npm- und Playwright-Checks im Docker-Profil `quality` aus.   |
| Report JSON    | Maschinenlesbarer Status für alle Checks.                                  |
| Nginx Hub      | Zeigt Score, Checkliste, Logs und HTML-Reports auf Port `8088`.            |
| Docker Volume  | Hält Reports nach Runner-Ende für Browser-Refresh und Präsentation bereit. |
