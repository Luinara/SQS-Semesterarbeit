# Einführung und Ziele

PalHabit ist unsere Web-App für die SQS-Semesterarbeit. Nutzer melden sich an,
erledigen Tagesquests, trinken Wasser und sammeln Quest-Punkte für ein
Pokémon-basiertes Begleittier. 

Die App besteht aus einem Angular-Frontend, einem Spring-Boot-Backend und einer
PostgreSQL-Datenbank.
Für die Abgabe ist nicht nur die App selbst wichtig. Wir zeigen auch, dass die
Qualitätssicherung wirklich ausgeführt wird: Backend-Tests, Frontend-Tests,
Coverage, statische Analyse, Security-Checks und Playwright-E2E laufen.

## Fachlicher Überblick

- Nutzer können sich registrieren und anmelden.
- Tagesquests und Wassertracking verändern den Spielstand.
- Quest-Punkte und Wasser steigern Wachstum und Pokémon-Fortschritt.
- Das Backend nutzt PokeAPI für Starter-Pokémon und fällt bei Problemen auf
  lokale Daten zurück.
- Das Frontend nutzt Wetterdaten für die Szene im Dashboard.
- Demo- und Quality-Start laufen reproduzierbar über Docker Compose.

## Qualitätsziele

| Priorität | Ziel                         | Nachweis                                                                                       |
|-----------| ---------------------------- |------------------------------------------------------------------------------------------------|
| 1         | Reproduzierbarer Start       | `docker compose up --build` startet App, Backend und Datenbank.                                |
| 2         | Testpyramide                 | Unit-, Integrations-, Architektur-, Security- und E2E-Tests sind dokumentiert und ausführbar.  |
| 3         | Stabile Demo                 | Demo-User, Starterdaten, Questfluss und E2E-Nutzerreise sind für die Präsentation abgesichert. |
| 4         | Klare Architektur            | Frontend, Backend und Datenbank sind getrennt beschrieben und nachvollziehbar. |
| 5         | Umgang mit externen Diensten | PokeAPI wird nur bei fehlenden Pokémon-Daten genutzt und hat Timeout/Fallback.                 |

## Stakeholder

| Rolle               | Erwartung                                                                         |
| ------------------- |-----------------------------------------------------------------------------------|
| Prüfer im SQS-Modul | Können App und Doku lokal nachvollziehen.                                         |
| Projektteam         | Kann die Demo ohne manuelle Datenbank-Reparatur starten und erklären.             |
| Nutzer der App      | Bekommen ein verständliches Dashboard für Quests, Wasser und Pokémon-Fortschritt. |
