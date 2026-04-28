# ADR-005: Use TypeScript for frontend

## Status
Accepted

## Context
We need a component-based frontend with static type checking to improve
maintainability and catch errors early.

## Alternatives
Dart 
JavaScript

## Decision
Use TypeScript 5.
Reasons: Developer resources, typed

## Consequences
- Strong typing across the codebase reduces runtime errors.
- Vite offers fast HMR and optimised production builds.

## Downsides
- No realtime runtime protection
- Slower than JavaScript because of types

