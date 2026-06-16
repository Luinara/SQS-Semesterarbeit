# Architektur

PokeHabit besteht aus Angular-Frontend, Spring-Boot-Backend und PostgreSQL.
Die Architektur ist in `docs/02-architecture/arc42/` nach arc42 dokumentiert.

## Bausteine

| Bereich | Aufgabe |
| --- | --- |
| Frontend | UI, App-State, Wetter-Szene, API-Mapping |
| Backend | Auth, Tasks, Spielstand, Pokemon-Daten, Sessions |
| Datenbank | Nutzer, Tasks, Spielstand und Pokemon |
| Externe APIs | PokeAPI fuer Starter-Pokemon, Open-Meteo fuer Wetter |

## Wichtige Dokumente

- `docs/02-architecture/arc42/README.md`
- `docs/02-architecture/arc42/05-building-block-view.md`
- `docs/02-architecture/arc42/06-runtime-view.md`
- `docs/02-architecture/arc42/07-deployment-view.md`
- `docs/02-architecture/diagrams/c4-diagram.md`
- `docs/02-architecture/diagrams/structurizr/workspace.dsl`
- `docs/adr/`
- `docs/ger-adr/`

## Architekturregeln

Die Schichtengrenzen werden mit ArchUnit geprueft. Controller, Services und
Repositorys sollen getrennt bleiben, damit HTTP, Fachlogik und Persistenz nicht
ineinanderlaufen.
