# Solution Strategy

Die Lösung ist bewusst überschaubar gehalten: Die App soll in der Demo direkt
benutzbar sein, und die Qualitätssicherung soll nicht nur in einzelnen
Terminalbefehlen versteckt sein. Deshalb gibt es zusätzlich zum normalen
Docker-Start den Quality Hub.

## Strategic Decisions

| Bereich | Strategie |
| --- | --- |
| Frontend | Angular mit Standalone Components. Seiten und Dashboard-Komponenten sind getrennt, HTTP läuft über Services, Fachlogik ist testbar ausgelagert. |
| Backend | Spring Boot mit Feature-Packages für Auth, User, Tasks, Pokemon und Konfiguration. Controller greifen nicht direkt auf Repositories zu. |
| Persistenz | PostgreSQL für den Docker-Betrieb, H2 für Backend-Tests. Prisma-Migrationen dokumentieren das DB-Schema zusätzlich. |
| Externe Daten | Wetter läuft über Frontend-Services; Starter-Pokemon werden im Backend über PokeAPI mit lokalem Fallback geladen. |
| Qualitätssicherung | Der Quality Hub führt die wichtigsten Checks gebündelt aus und zeigt Logs/Reports an. |
| Deployment | Docker Compose startet App, DB und optional den Quality Hub. |

## Quality Approach

- Unit-Tests prüfen Frontend-Logik, Services, Backend-Services und Controller.
- ArchUnit, Checkstyle und SpotBugs prüfen die Backend-Struktur.
- Der PokeAPI-Service wird mit lokalem HTTP-Stub getestet, damit Timeout/Fallback ohne echte Netzabhängigkeit nachweisbar sind.
- TypeScript, ESLint und npm-Lockfile-Tests prüfen Frontend-Qualität und Supply-Chain-Risiken.
- Playwright deckt die wichtigsten Klickwege im Browser ab.
- Der Quality Hub sammelt diese Ergebnisse für die Abgabe an einer Stelle.
