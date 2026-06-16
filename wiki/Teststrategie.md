# Teststrategie

Die Teststrategie folgt einer Testpyramide: viele schnelle Unit-Tests, weniger
Integrations- und Controller-Tests, wenige browserbasierte E2E-Flows.

## Ebenen

| Ebene | Beispiele | Ausführung |
| --- | --- | --- |
| Unit-Tests | Services, Fachlogik, Mock-Daten, Mapping | `mvn test`, `npm test` |
| Controller-/Security-Tests | Statuscodes, Auth-Pflicht, Fehlerkörper | `mvn test` |
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
- `docs/04-quality/daily-reset-testfaelle.md`

## Lokale Java-Hinweise

- Backend-Tests mit JDK ausfuehren, nicht mit reinem JRE.
- `SelfCareApplicationTests` prueft Spring-Kontext, zentrale Beans, H2-Testprofil
  und UTC-Clock.
- `UserServiceTest` prueft den Daily Reset auch mit `Duration.ofMinutes(1)`.
- Fuer Java 25 aktiviert Maven lokal ein Kompatibilitaetsprofil; CI bleibt auf
  Java 21 mit JaCoCo-Coverage.

## Wetter-Nachweis

Die Wetter-Szene wird automatisiert getestet. Für den manuellen Nachweis gibt
es:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\weather-curl-check.ps1 -City "Hawaii" -RawJson
```

Die passende Doku liegt unter
`docs/04-quality/weather-open-meteo-manual-check.md`.
