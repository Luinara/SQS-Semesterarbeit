# Einführung und Ziele

PokeHabit ist unsere Web-App für die SQS-Semesterarbeit. Nutzer melden sich an,
erledigen Tagesquests, trinken Wasser und sammeln Trainingspunkte für ein
Pokemon-basiertes Begleittier. Die App besteht aus Angular-Frontend,
Spring-Boot-Backend und PostgreSQL.

Für die Abgabe ist nicht nur die App selbst wichtig. Wir zeigen auch, dass die
Qualitätssicherung wirklich ausgeführt wird: Backend-Tests, Frontend-Tests,
Coverage, statische Analyse, Security-Checks und Playwright-E2E laufen über den
Docker-Quality-Hub und sind dort als Report sichtbar.

## Fachlicher Überblick

- Nutzer können sich registrieren und anmelden.
- Tagesquests und Wassertracking verändern den Spielstand.
- Trainingspunkte steigern Motivation, Wachstum und Pokemon-Fortschritt.
- Das Backend nutzt PokeAPI für Starter-Pokemon und fällt bei Problemen auf
  lokale Daten zurück.
- Das Frontend nutzt Wetterdaten für die Szene im Dashboard.
- Demo- und Quality-Start laufen reproduzierbar über Docker Compose.

## Qualitätsziele

| Priorität | Ziel | Nachweis |
| --- | --- | --- |
| 1 | Reproduzierbarer Start | `docker compose up --build` startet App, Backend und Datenbank. |
| 2 | Sichtbare Qualitätssicherung | `docker compose --profile quality up --build` startet den Quality Hub mit Logs und Reports. |
| 3 | Testpyramide | Unit-, Integrations-, Architektur-, Security- und E2E-Tests sind dokumentiert und ausführbar. |
| 4 | Stabile Demo | Demo-User, Starterdaten, Questfluss und E2E-Nutzerreise sind für die Präsentation abgesichert. |
| 5 | Umgang mit externen Diensten | PokeAPI wird nur bei fehlenden Pokemon-Daten genutzt und hat Timeout/Fallback. |

## Stakeholder

| Rolle | Erwartung |
| --- | --- |
| Prüfer im SQS-Modul | Können App, Doku und Quality Hub lokal nachvollziehen. |
| Projektteam | Kann die Demo ohne manuelle Datenbank-Reparatur starten und erklären. |
| Nutzer der App | Bekommen ein verständliches Dashboard für Quests, Wasser und Pokemon-Fortschritt. |
