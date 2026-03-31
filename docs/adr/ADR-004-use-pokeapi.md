# ADR-004: Integrate PokeAPI as external service

## Status
Accepted

## Context
The self-care app needs gamification elements. PokeAPI provides a free, well-documented
REST API for Pokémon data.

## Decision
Use PokeAPI (https://pokeapi.co/api/v2/) as the external service. All calls are
encapsulated in the `integration/` package of the backend.

## Consequences
- No API key required; the service is publicly available.
- WireMock stubs the external API in integration tests to avoid network dependency.
- Rate limits apply; caching should be considered before production use.
