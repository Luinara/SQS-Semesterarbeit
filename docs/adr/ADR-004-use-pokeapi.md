# ADR-004: Integrate PokeAPI as external service

## Status
Accepted

## Context
The self-care app needs gamification elements. PokeAPI provides a free, well-documented
REST API for Pokémon data.

## ALternatives
- Manual database maintenance
- Local Pokémon dataset
- Commercial Pokémon APIs

## Decision
Use PokeAPI (https://pokeapi.co/api/v2/) as the authoritative source for Pokémon data during database seeding.

Imported data:

- Pokémon ID
- Name
- Official artwork
- Evolution chain

## Consequences
- No manual maintenance of Pokémon data.
- No API key is required; the service is publicly available.
- WireMock stubs the external API in integration tests to avoid network dependency.
- Rate limits apply; caching should be considered before production use.

## Downsides
- Dependence on this particular service
- no commercial licenses
