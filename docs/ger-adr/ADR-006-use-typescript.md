# ADR-006: TypeScript für das Frontend verwenden

## Status
Akzeptiert

## Kontext
Wir brauchen ein komponentenbasiertes Frontend mit statischer Typprüfung, um
Wartbarkeit zu verbessern und Fehler früh zu erkennen.

## Alternativen
Dart
JavaScript

## Entscheidung
TypeScript 5 verwenden.
Gründe: Entwicklerressourcen, typisiert

## Konsequenzen
- Starke Typisierung über die gesamte Codebasis reduziert Laufzeitfehler.
- Vite bietet schnelles HMR und optimierte Production-Builds.

## Nachteile
- Kein Runtime-Echtzeitschutz
- Langsamer als JavaScript wegen Typen
