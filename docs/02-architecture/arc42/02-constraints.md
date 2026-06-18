# Randbedingungen

Dieses Kapitel hält fest, welche Vorgaben und Grenzen die Architektur von
PokeHabit beeinflusst haben. Es geht hier nicht um Wunscharchitektur, sondern
um den Stand, der für die Abgabe gebaut und geprüft wurde.

## Technische Randbedingungen

| Randbedingung | Auswirkung im Projekt |
| --- | --- |
| Java 21 und Spring Boot | Das Backend ist als Spring-Boot-Anwendung mit Maven aufgebaut. |
| PostgreSQL | Persistenz läuft im Docker-Stack über PostgreSQL; Tests nutzen H2 oder gemockte Abhängigkeiten. |
| Angular und TypeScript | Das Frontend nutzt Angular Standalone Components, Signals, SCSS und Vitest. |
| Docker Compose | App, Backend, Datenbank und optional Quality Hub sind lokal reproduzierbar startbar. |
| Externer Backend-Service | PokeAPI wird im Backend über `PokeApiPokemonService` angebunden. Timeout und Fallback sind getestet. |
| Externer Frontend-Service | Open-Meteo wird im Frontend für die Wetter-Szene genutzt; bei Fehlern bleibt ein lokaler Zustand sichtbar. |
| Qualitätssicherung | Der Quality Hub führt Maven-, npm- und Playwright-Checks aus und sammelt Logs/Reports im Docker-Volume. |
| ReadTheDocs | Die Konfiguration liegt im Repository;  |

## Organisatorische Randbedingungen

| Randbedingung | Auswirkung im Projekt |
| --- | --- |
| SQS-Semesterarbeit | Architektur, Tests, Security, Doku und reproduzierbarer Start sind Teil des Abgabenachweises. |
| Begrenzte Restzeit | Änderungen kurz vor Abgabe bleiben klein: Demo stabilisieren, Tests absichern, Doku konkretisieren. |
| Teamarbeit | Entscheidungen sind in ADRs und arc42 dokumentiert, damit sie im Team und in der Präsentation erklärbar bleiben. |
| Präsentation | Demo-User, Quality Hub, Testpyramide und C4-Modell sind als feste Vorführpunkte vorbereitet. |

## Rechtliche und datenschutznahe Randbedingungen

| Randbedingung | Auswirkung im Projekt |
| --- | --- |
| Keine produktive Plattform | Die App ist ein lokaler Abgabestand, kein öffentlich betriebener Dienst. |
| Zugangsdaten | Passwörter werden nicht im Frontend gespeichert; der Demo-Login ist bewusst nur für lokale Demo gedacht. |
| Externe APIs | PokeAPI und Open-Meteo liefern nur fachliche Zusatzdaten; bei Ausfall bleibt die App benutzbar. |
| Hochschulabgabe | Quellen, Architekturentscheidungen und bekannte Grenzen werden dokumentiert statt im Vortrag versteckt. |
