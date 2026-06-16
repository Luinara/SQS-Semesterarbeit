# Teststrategie

Die Teststrategie folgt einer Testpyramide: viele schnelle Unit-Tests, weniger
Integrations- und Controller-Tests, wenige browserbasierte E2E-Flows.

## Ebenen

| Ebene | Beispiele | Ausfuehrung |
| --- | --- | --- |
| Unit-Tests | Services, Fachlogik, Mock-Daten, Mapping | `mvn test`, `npm test` |
| Controller-/Security-Tests | Statuscodes, Auth-Pflicht, Fehlerkoerper | `mvn test` |
| Integrationstests | Spring-Kontext und Persistenzpfade | `mvn verify` |
| Architekturtests | Schichtengrenzen mit ArchUnit | `mvn test` |
| Security | npm-Lockfile-Guardrails, `npm audit` | `npm run security:frontend` |
| E2E | Login, Dashboard, Wasser, Quest, Training, Logout | `npm run test:e2e` |

## Wichtige Orte

- `backend/src/test/java/`
- `tests/unit/frontend/`
- `tests/e2e/`
- `frontend/vitest.config.ts`
- `frontend/playwright.config.ts`
- `docs/04-quality/test-pyramid.md`
- `docs/04-quality/frontend-npm-security.md`

## Wetter-Nachweis

Die Wetter-Szene wird automatisiert getestet. Fuer den manuellen Nachweis gibt
es:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\weather-curl-check.ps1 -City "Hawaii" -RawJson
```

Die passende Doku liegt unter
`docs/04-quality/weather-open-meteo-manual-check.md`.
