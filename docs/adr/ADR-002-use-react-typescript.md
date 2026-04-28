# ADR-002: Use Angular for frontend

## Status
Accepted

## Context
We need a component-based frontend with static type checking to improve
maintainability and catch errors early.

## Alternatives
React

## Decision
Use Angular (with TypeScript 5), bundled by Vite.
Reasons: Developer resources, structural

## Consequences
- Strong typing across the codebase reduces runtime errors.
- Vite offers fast HMR and optimised production builds.
- Vitest integrates natively for unit tests; Playwright handles e2e.

## Downsides
- Updates can contain breaking changes 


