# ADR-008: Verdeckte Ei-Pokémon-Zuweisung verwenden

## Status

Akzeptiert

## Kontext

Jeder Nutzer startet die Anwendung mit einem Pokémon-Ei, das später schlüpft.

## Alternativen

* Nutzer wählt ein Starter-Pokémon
* Festes Starter-Pokémon
* Zufälliges Pokémon wird sofort gezeigt

## Entscheidung

Beim Erstellen des Nutzers ein zufälliges Pokémon zuweisen.

Das zugewiesene Pokémon wird in `eggPokemonId` gespeichert und bleibt verborgen, bis das Ei schlüpft.

Jedes Pokémon hat dieselbe Wahrscheinlichkeit, zugewiesen zu werden.

## Konsequenzen

* Schafft Vorfreude und Progression.
* Unterstützt die zentrale Spielmechanik.
* Erlaubt zukünftige Erweiterung mit Seltenheitssystemen, falls gewünscht.

## Nachteile

* Nutzer können ihren Starter nicht wählen.
* Manche Nutzer mögen zufällige Zuweisung möglicherweise nicht.
