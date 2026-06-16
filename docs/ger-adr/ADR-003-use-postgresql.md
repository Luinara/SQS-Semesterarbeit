# ADR-003: PostgreSQL als Persistenzschicht verwenden

## Status
Akzeptiert

## Kontext
Die Anwendung benötigt dauerhafte Speicherung für Nutzer- und Task-Daten.

## Alternativen
- MongoDB
- SQLite
- MySQL

## Entscheidung
PostgreSQL als primäre Datenbank verwenden. H2 In-Memory wird während automatisierter Tests verwendet.
Gründe: Sicher für Nutzerdaten, keine korrupten Zustände, hervorragend für strukturierte Daten, Skalierung, Industriestandard, Docker-freundlich.

## Konsequenzen
- Bewährte relationale Datenbank mit guter Spring-Data-JPA-Unterstützung.
- Docker Compose macht das lokale Setup unkompliziert.
- H2 erlaubt schnelle, isolierte Tests ohne laufenden Datenbankserver.

## Nachteile
- Ressourcenverbrauch
- Overkill
