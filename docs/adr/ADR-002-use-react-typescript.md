# ADR-002: Use React + TypeScript for frontend

## Status
Accepted

## Context
We need a component-based frontend with static type checking to improve
maintainability and catch errors early.

## Decision
Use React 18 with TypeScript 5, bundled by Vite.

## Consequences
- Strong typing across the codebase reduces runtime errors.
- Vite offers fast HMR and optimised production builds.
- Vitest integrates natively for unit tests; Playwright handles e2e.
