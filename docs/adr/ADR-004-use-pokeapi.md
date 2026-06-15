# ADR-004: PokeAPI als externer Backend-Service

## Status
Accepted

## Context
Die App braucht Pokemon-Daten für den Starter-Partner. Die PDF-Checkliste
verlangt außerdem, dass das Backend selbst mit mindestens einem externen
Service spricht. PokeAPI passt dazu gut, weil die Starter-Pokemon dort ohne API
Key abrufbar sind und die Daten fachlich wirklich zur App gehören.

## Alternatives
- Nur lokale Starter-Daten pflegen.
- Pokemon-Daten ausschließlich im Frontend laden.
- Einen kommerziellen Pokemon-Service anbinden.

## Decision
Das Backend nutzt PokeAPI (`https://pokeapi.co/api/v2`) beim Anlegen eines
Users, um fehlende Starter-Pokemon in der Datenbank zu befüllen. Bereits
vorhandene Pokemon werden wiederverwendet, damit Registrierungen nicht
unnötig externe Requests auslösen und vorhandene Namen/Bilder nicht
überschrieben werden. Lokale Evolutions-Metadaten dürfen ergänzt werden, weil
die App nur die drei Starter-Ketten braucht.

Abgerufene Daten:

- Pokemon ID
- Name
- Official artwork

Der Zugriff läuft mit kurzen Timeouts. Wenn PokeAPI nicht erreichbar ist, einen
Fehlerstatus liefert oder unvollständige Daten zurückgibt, nutzt das Backend den
lokalen Starter-Katalog als Fallback. Im Testprofil sind externe Aufrufe
deaktiviert; der Service selbst wird mit einem lokalen HTTP-Stub getestet.

## Consequences
- Die App startet auch ohne Internet oder bei PokeAPI-Ausfall weiter.
- Der externe Service ist im Backend nachweisbar und nicht nur im Frontend.
- Tests bleiben stabil, weil sie nicht von echter Netzverfügbarkeit abhängen.
- Bei produktiver Nutzung wäre Caching sinnvoll, damit Registrierungen nicht
  unnötig viele externe Requests auslösen.

## Downsides
- Es gibt eine zusätzliche externe Abhängigkeit.
- Die Pokemon-Daten sind nur so aktuell und verfügbar wie PokeAPI.
