# Testpyramide

Die Testpyramide ist für PokeHabit der zentrale SQS-Nachweis. Wir trennen die
Tests nach Zweck: viele schnelle Unit-Tests unten, weniger Integrations- und
Controller-Tests in der Mitte, wenige browserbasierte E2E-Flows oben. Ergänzt
wird das durch Architektur-, Security- und statische Analysechecks.

## Überblick

| Ebene | Ziel | Beispiele im Projekt | Ausführung |
| --- | --- | --- | --- |
| Unit-Tests | Fachlogik schnell und isoliert prüfen | `AuthenticationServiceTest`, `TaskServiceTest`, `UserServiceTest`, `tests/unit/frontend/*.test.ts` | `mvn test`, `npm test` |
| Controller-/Security-nahe Tests | HTTP-Status, Auth-Pflicht, Fehlerkörper und Session-Verhalten prüfen | `TaskControllerTest`, `UserControllerTest`, `AuthenticationControllerUnitTest` | `mvn test` |
| Integrationstests | Spring-Kontext, Repositorys und echte Persistenzpfade mit H2 prüfen | `AuthenticationControllerIntegrationTest`, `UserControllerIntegrationTest`, `AuthenticationControllerConcurrentSignUpIT` | `mvn verify` / Failsafe im Verify-Lauf |
| Architekturtests | Paketregeln und Schichtengrenzen prüfen | `ArchitectureTest` mit ArchUnit | `mvn test` |
| Externe-Service-Tests | PokeAPI-Anbindung ohne echtes Internet prüfen | `PokeApiPokemonServiceTest` mit lokalem HTTP-Stub | `mvn test` |
| Frontend-Supply-Chain-Security | Lockfile und npm-Audit prüfen | `npm-security.test.ts`, `npm audit` | `npm run security:frontend` |
| E2E-Tests | sichtbare Nutzerflüsse im Browser prüfen | `user-journey.spec.ts`, `starter-evolution.spec.ts` | `npm run test:e2e` |

## Warum diese Aufteilung?

Viele Fachregeln lassen sich ohne Browser und ohne Datenbank testen. Diese
Tests sind schnell und geben früh Feedback. HTTP-, Security- und
Integrationstests prüfen danach, ob die Regeln über die echten Endpunkte sauber
erreichbar sind. Playwright läuft bewusst nur für wenige wichtige Nutzerreisen,
weil Browsertests langsamer sind und mehr bewegliche Teile haben.

## Abgedeckte Qualitätsfragen

| Frage aus SQS-Sicht | Nachweis |
| --- | --- |
| Funktioniert Login, Registrierung und Logout? | `AuthenticationServiceTest`, `AuthenticationControllerUnitTest`, `AuthenticationControllerIntegrationTest` |
| Wird Inaktivität fachlich wirksam? | `AuthenticationServiceTest` prüft Streak-Reset, Level-Abzug und Motivationsverlust nach ausgelassenem Tag. |
| Sind geschützte Endpunkte wirklich geschützt? | `UserControllerTest`, `TaskControllerTest` |
| Gibt es einen öffentlichen Endpunkt? | `TaskControllerTest` prüft `GET /api/tasks`. |
| Funktioniert Persistenz über mehrere Schichten? | Spring-Boot-Integrationstests mit H2. |
| Ist der externe Backend-Service ausfallsicher angebunden? | `PokeApiPokemonServiceTest` prüft API-Erfolg, Fehlerstatus und deaktivierten Zugriff. |
| Bleiben Controller von Repositorys getrennt? | `ArchitectureTest` mit ArchUnit. |
| Gibt es Coverage-Nachweise? | JaCoCo im Backend, Vitest Coverage im Frontend. |
| Gibt es einen echten Browserflow? | Playwright prüft Login, Dashboard, Wasser, Quest, Training, Logout und Starter-Entwicklung. |
| Werden Frontend-Abhängigkeiten geprüft? | `npm run security:frontend` kombiniert Lockfile-Test und `npm audit`. |

## Quality Hub

Der Quality Hub führt die Pyramide nicht nur einzeln im Terminal aus, sondern
sammelt die Ergebnisse an einer Stelle:

```bash
docker compose --profile quality up --build
```

Pflichtchecks im Runner:

- Backend-Unit- und Integrationstests mit JaCoCo
- Checkstyle
- SpotBugs
- Frontend-Typecheck
- Frontend-Unit-Tests
- Frontend-Coverage
- ESLint
- Frontend-Security-Check

Optionaler E2E-Check:

- Playwright-User-Flow gegen den Docker-App-Stack, wenn Frontend und Backend erreichbar sind.

## Präsentationshinweis

In der Präsentation nicht jede Testdatei einzeln erklären. Besser:

1. Testpyramide zeigen.
2. Ein Beispiel pro Ebene nennen.
3. Im Quality Hub zeigen, dass die Checks wirklich gelaufen sind.
4. Kurz sagen, was das Gate rot machen würde: Tests, Security, Typecheck, Lint
   oder Backend-Analysefehler.
