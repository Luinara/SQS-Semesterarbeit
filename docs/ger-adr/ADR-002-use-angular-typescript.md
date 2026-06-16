# ADR-002: Angular für das Frontend verwenden

## Status
Akzeptiert

## Kontext
Wir brauchen ein komponentenbasiertes Frontend mit statischer Typprüfung, um
Wartbarkeit zu verbessern und Fehler früh zu erkennen.

## Alternativen
React

## Entscheidung
Angular (mit TypeScript 5), gebundelt durch Vite, verwenden.
Gründe: Entwicklerressourcen, strukturell

## Konsequenzen
- Starke Typisierung über die gesamte Codebasis reduziert Laufzeitfehler.
- Vite bietet schnelles HMR und optimierte Production-Builds.
- Vitest integriert sich nativ für Unit-Tests; Playwright übernimmt E2E.

## Nachteile
- Updates können Breaking Changes enthalten
