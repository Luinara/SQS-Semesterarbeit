# ADR-005: Use hidden egg Pokémon assignment

## Status

Accepted

## Context

Each user starts the application with a Pokémon egg that later hatches.

## Alternatives

* User selects a starter Pokémon
* Fixed starter Pokémon
* Random Pokémon revealed immediately

## Decision

Assign a random Pokémon during user creation.

The assigned Pokémon is stored in `eggPokemonId` and remains hidden until the egg hatches.

Each Pokémon has the same probability of being assigned.

## Consequences

* Creates anticipation and progression.
* Supports the core game mechanic.
* Allows future expansion with rarity systems if desired.

## Downsides

* Users cannot choose their starter.
* Some users may dislike random assignment.
