# Lösungsstrategie

Die Lösung ist bewusst überschaubar gehalten: Die App soll in der Demo direkt
benutzbar sein, und die Qualitätssicherung soll nicht nur in einzelnen
Terminalbefehlen versteckt sein. Deshalb gibt es zusätzlich zum normalen
Docker-Start den Quality Hub.

## Strategische Entscheidungen

| Bereich            | Strategie                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend           | Angular mit Standalone Components. Seiten und Dashboard-Komponenten sind getrennt, HTTP läuft über Services, Fachlogik ist testbar ausgelagert.                         |
| Backend            | Spring Boot mit Feature-Packages für Auth, User, Tasks, Pokémon und Konfiguration. Controller greifen nicht direkt auf Repositories zu, sondern delegieren an Services. |
| Persistenz         | PostgreSQL für den Docker-Betrieb, H2 für Backend-Tests. Prisma-Migrationen dokumentieren das DB-Schema zusätzlich.                                                     |
| Externe Daten      | Wetter läuft über Frontend-Services; Starter-Pokémon werden im Backend über PokeAPI mit lokalem Fallback geladen.                                                       |
| Qualitätssicherung | Der Quality Hub führt die wichtigsten Checks gebündelt aus und zeigt Logs/Reports an.                                                                                   |
| Deployment         | Docker Compose startet App, DB und optional den Quality Hub.                                                                                                            |

## Architekturansatz

Das Projekt verwendet eine mehrschichtige Webarchitektur mit hexagonalen Elementen im Backend.

Die Anwendung besteht aus einem Angular-Frontend, einem Spring-Boot-Backend, einer PostgreSQL-Datenbank sowie externen Schnittstellen zur PokeAPI und Wetter-API. Die Kommunikation zwischen Frontend und Backend erfolgt über eine REST-API.

Im Backend sind die Verantwortlichkeiten bewusst getrennt: REST-Controller nehmen HTTP-Anfragen entgegen, Services enthalten die zentrale Anwendungslogik, Repositories kapseln den Datenbankzugriff und externe API-Clients kapseln die Kommunikation mit Fremdsystemen.

Damit folgt das Backend nicht einer vollständig strengen Hexagonal Architecture, übernimmt aber zentrale Prinzipien davon. Die fachliche Logik steht im Mittelpunkt, während technische Details wie REST, Persistenz und externe APIs als Adapter darum herum angeordnet sind. Controller bilden dabei primäre Adapter, Repositories und externe Clients sekundäre Adapter. Diese Struktur verbessert Testbarkeit, Wartbarkeit und Austauschbarkeit einzelner Komponenten.

## Qualitätsansatz

* Unit-Tests prüfen ausgelagerte Frontend-Logik, Angular-Services und Backend-Services.
* Controller- und Integrationstests prüfen REST-Endpunkte, Authentifizierung und Zusammenspiel mit der Anwendungsschicht.
* ArchUnit, Checkstyle und SpotBugs prüfen die Backend-Struktur.
* Der PokeAPI-Service wird mit lokalem HTTP-Stub getestet, damit Timeout/Fallback ohne echte Netzabhängigkeit nachweisbar sind.
* TypeScript, ESLint und npm-Lockfile-Tests prüfen Frontend-Qualität und Supply-Chain-Risiken.
* Playwright deckt die wichtigsten Klickwege im Browser ab.
* Der Quality Hub sammelt diese Ergebnisse für die Abgabe an einer Stelle.
