# Quality Hub

Der Quality Hub ist das sichtbare SQS-Dashboard für die Abgabe. Er startet per
Docker Compose und zeigt echte Ergebnisse aus Backend, Frontend, Security,
Architektur, Coverage und E2E.

## Start

```bash
docker compose --profile quality up --build
```

Danach:

| Dienst | URL |
| --- | --- |
| App | `http://localhost:3000` |
| Backend | `http://localhost:8181` |
| Quality Hub | `http://localhost:8088` |

## Checks im Runner

- `mvn verify`
- `mvn checkstyle:check`
- `mvn compile spotbugs:check`
- `npm run type-check`
- `npm test`
- `npm run test:coverage`
- `npm run lint`
- `npm run security:frontend`
- optional `npm run test:e2e`

Die Ergebnisse liegen im Docker-Volume `quality_output` und werden im Hub unter
`/reports/` angezeigt.

Ausführliche Doku: `quality/README.md` und `docs/04-quality/test-pyramid.md`.
