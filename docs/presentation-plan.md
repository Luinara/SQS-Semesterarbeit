# Präsentationsablauf

Ziel: In 15 Minuten zeigen, dass PokeHabit als App funktioniert und dass die
Softwarequalität nicht nur behauptet, sondern automatisiert nachgewiesen wird.

## Vorbereitung vor der Präsentation

1. Docker starten:

   ```bash
   docker compose --profile quality up --build
   ```

2. Browser-Tabs öffnen:

   | Tab          | URL                                         | Zweck                          |
   | ------------ | ------------------------------------------- | ------------------------------ |
   | App          | `http://localhost:3000`                     | Live-Demo                      |
   | Backend      | `http://localhost:8181/api/tasks`           | öffentlicher REST-Endpunkt     |
   | Quality Hub  | `http://localhost:8088`                     | Tests, Coverage, Security, E2E |
   | Testpyramide | `docs/test-pyramid.md`                      | SQS-Testnachweis               |
   | Doku         | ReadTheDocs-URL oder lokale `docs/index.md` | arc42, ADRs, C4                |
   | C4           | `docs/diagrams/c4-diagram.md`               | Architekturüberblick           |

3. Demo-Login bereithalten:

   ```text
   demo / password123
   ```

4. Fallback, falls Live-Docker hakt:
   - Quality Hub Screenshot oder letzter Report aus dem Docker-Volume zeigen.
   - C4-Diagramm und Testkonzept aus der Doku zeigen.
   - Kurz sagen: "Die App ist dockerisiert; wenn der Live-Start auf dem Vorführrechner hängt, zeigen wir den letzten lokal erzeugten Quality-Report."

## 15-Minuten-Ablauf

| Zeit          | Inhalt                  | Was zeigen                                                                       | Kernaussage                                                                                                                               |
| ------------- | ----------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00 - 1:00   | Einstieg                | App-Startseite oder Dashboard                                                    | "PokeHabit verbindet kleine Self-Care-Aufgaben mit einem Pokémon-Partner."                                                                |
| 1:00 - 3:30   | Live-Demo Nutzerfluss   | Registrierung/Login, Dashboard, Quest, Wasser, Level-Up-Test, Logout             | "Die App ist nicht nur ein Mockup; Frontend und Backend sprechen über echte REST-Endpunkte."                                              |
| 3:30 - 5:00   | API und Security        | `/api/tasks`, geschützter Game-State, Session-Cookie erklären                    | "Es gibt öffentliche und geschützte Endpunkte, Passwörter werden gehasht, Sessions laufen serverseitig."                                  |
| 5:00 - 6:30   | Externer Service        | Wetter-Szene im Dashboard oder Code `WeatherService` / `OpenMeteoWeatherAdapter` | "Die App nutzt Open-Meteo für echte Wetterdaten und passt die Dashboard-Szene daran an."                                                  |
| 6:30 - 8:30   | Architektur             | C4-Diagramm + Structurizr-DSL                                                    | "Das System ist in Frontend, Backend, Persistenz, externe Dienste und Quality Hub getrennt."                                              |
| 8:30 - 11:30  | Testkonzept             | Testpyramide + Quality Hub                                                       | "Die Testpyramide ordnet Unit-, Integrations-, Security-, Architektur- und E2E-Tests ein. Der Quality Hub führt die Checks sichtbar aus." |
| 11:30 - 13:00 | Doku und Entscheidungen | arc42, ADRs, ReadTheDocs                                                         | "Die wichtigsten Architekturentscheidungen sind nachvollziehbar dokumentiert."                                                            |
| 13:00 - 14:30 | Risiken und Grenzen     | arc42 Risiken                                                                    | "Wir benennen bewusst Grenzen: Deployment-Hardening, externe APIs, Tageshistorie."                                                        |
| 14:30 - 15:00 | Abschluss               | Quality Hub oder App                                                             | "Das Projekt ist per Docker startbar und die Qualitätssicherung ist reproduzierbar."                                                      |

## 30-Minuten-Ablauf

| Zeit          | Inhalt                              | Was zeigen                                                                                                      | Kernaussage                                                                                                             |
| ------------- | ----------------------------------- |-----------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| 0:00 - 2:00   | Einstieg und Ziel der App           | App-Startseite oder Dashboard                                                                                   | "PokeHabit verbindet tägliche Self-Care-Aufgaben mit einem Pokémon-Partner und macht Fortschritt spielerisch sichtbar." |
| 2:00 - 7:00   | Live-Demo Nutzerfluss               | Registrierung oder Demo-Login, Dashboard, Quest abschließen, Wasser trinken, Logout                             | "Die App ist kein Mockup: Frontend, Backend und Datenbank arbeiten über echte REST-Endpunkte zusammen."                 |
| 7:00 - 10:00  | Fachliche Logik                     | XP, Quest-Punkte, Wasser, Pokémon-Fortschritt, Tagesquests                                                      | "Die Kernlogik ist fachlich nachvollziehbar und wird serverseitig abgesichert."                                         |
| 10:00 - 13:00 | API, Authentifizierung und Security | `/api/tasks`, geschützte Game-State-Endpunkte, Session-Cookie, Passwort-Hashing                                 | "Öffentliche und geschützte Endpunkte sind getrennt; nutzerbezogene Aktionen laufen über serverseitige Sessions."       |
| 13:00 - 15:00 | Externer Service                    | Wetter-Szene im Dashboard oder Code `WeatherService` / `OpenMeteoWeatherAdapter`                                | "Open-Meteo wird als externer Dienst gekapselt; bei Fehlern bleibt die App nutzbar."                                    |
| 15:00 - 19:00 | Architektur                         | C4-Diagramm, Frontend/Backend/DB/externe Dienste/Quality Hub, Feature-Packages                                  | "Das System ist klar geschnitten und die Architektur unterstützt Testbarkeit und Wartbarkeit."                          |
| 19:00 - 23:30 | Testkonzept und Testpyramide        | `test-pyramid.md`, `test-concept.md`, Beispiele für Unit-, Integrations-, Security-, Architektur- und E2E-Tests | "Die Testpyramide ist nicht nur dokumentiert, sondern durch konkrete Tests und Reports belegt."                         |
| 23:30 - 26:00 | Quality Hub und CI                  | Quality Hub, Reports, Coverage, Logs, GitHub Actions                                                            | "Qualität wird automatisiert geprüft und für Prüfer sichtbar gemacht."                                                  |
| 26:00 - 28:00 | Dokumentation und ADRs              | arc42, C4, ADRs, ReadTheDocs                                                                                    | "Architekturentscheidungen und Grenzen sind nachvollziehbar dokumentiert."                                              |
| 28:00 - 29:15 | Risiken und Grenzen                 | Risiken im arc42-Dokument oder Testkonzept                                                                      | "Wir benennen bewusst, was für Produktivbetrieb noch fehlt."                                                            |
| 29:15 - 30:00 | Abschluss                           | App oder Quality Hub                                                                                            | "PokeHabit ist per Docker startbar, fachlich demonstrierbar und qualitätsgesichert nachvollziehbar."                    |

## Sprechtext pro Abschnitt

### Einstieg

"Wir zeigen PokeHabit, eine kleine Self-Care-Web-App. Nutzer erledigen tägliche
Aufgaben, trinken Wasser und begleiten dadurch einen Pokémon-Partner. Für die
Semesterarbeit war uns wichtig, nicht nur eine Oberfläche zu bauen, sondern den
Qualitätsnachweis lokal sichtbar zu machen."

### Live-Demo

"Ich logge mich mit dem Demo-User ein. Das Dashboard lädt den Nutzerzustand aus
dem Backend. Wenn ich eine Quest abschließe oder Wasser trinke, geht das über
die API zurück ins Backend und wird persistiert. Quest-Fortschritt verändert XP,
Level und später auch die Entwicklung des Pokémon."

### API und Security

"Ein Teil der API ist öffentlich, zum Beispiel die Task-Liste. Nutzerbezogene
Aktionen sind geschützt und laufen über eine serverseitige Session. Passwörter
werden nicht im Klartext gespeichert. Für Login gibt es zusätzlich Schutz gegen
wiederholte Fehlversuche."

### Externer Service

"Als externen Service nutzen wir Open-Meteo für die Wetter-Szene im Dashboard.
Der `WeatherService` ruft über den `OpenMeteoWeatherAdapter` zuerst die
Geocoding-API für eine eingegebene Stadt auf und lädt danach aktuelle
Wetterdaten wie Temperatur, Wettercode und Tag/Nacht. Diese Daten werden in
eine sichtbare Szene gemappt, also zum Beispiel Sonne, Regen, Schnee, Nebel
oder Nachtstimmung. Wenn der Dienst nicht erreichbar ist, bleibt die App
nutzbar und zeigt eine verständliche Fehlermeldung beziehungsweise den
lokalen Standardzustand."

### Architektur

"Im C4-Modell sieht man die Grenzen des Systems: Browser, Angular-Frontend,
Spring-Boot-Backend, PostgreSQL und externe Dienste. Die Backend-Komponenten
sind nach Feature-Packages getrennt. Controller greifen nicht direkt auf
Repositories zu; das prüfen wir auch mit ArchUnit."

### Quality Hub

"Für die Abgabe wollten wir die Testpyramide nicht nur behaupten. In der Doku
ordnen wir die Tests nach Ebene ein: Unit-Tests, Controller- und
Integrationstests, Security-nahe Tests, ArchUnit und Playwright. Der Quality Hub
führt die Checks aus, sammelt Reports und macht das Ergebnis direkt sichtbar.
Pflichtchecks machen das Gate rot, wenn Tests, Security, Typecheck, Lint oder
Backend-Analyse fehlschlagen."

### Doku und ADRs

"Die Architektur ist in arc42 dokumentiert. Wichtige Entscheidungen stehen als
ADRs im Repository, zum Beispiel Spring Boot, PostgreSQL und Angular.
Die ReadTheDocs-Konfiguration liegt im Repository, damit die Doku öffentlich
gebaut werden kann."

### Risiken

"Wir haben bekannte Grenzen dokumentiert. Für einen echten Produktivbetrieb
müssten Cookie-Secure-Flags, Deployment-Hardening und externe API-Caches noch
ausgebaut werden. Für die Semesterarbeit ist der lokale Docker-Start und der
Quality-Nachweis der relevante Fokus."

## Mögliche Fragen und gute Antworten

| Frage                                         | Antwort                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Warum Angular statt React?                    | "React wäre möglich gewesen und ist flexibler. Dagegen sprach für uns, dass React Routing, State-Struktur, Guards, Formularansatz und Projektkonventionen stärker offenlässt. Angular bringt diese Struktur direkter mit, was für Testbarkeit, Teamarbeit und klare Trennung in dieser Semesterarbeit besser gepasst hat."                                                                                                                                                                         |
| Wo ist der externe Service?                   | "`WeatherService` im Frontend nutzt den `OpenMeteoWeatherAdapter`. Der Adapter ruft Open-Meteo Geocoding für die Stadt und danach die Forecast-API für Temperatur, Wettercode und Tag/Nacht ab."                                                                                                                                                                                                                                                                                                   |
| Was passiert, wenn die Wetter-API down ist?   | "Die App bleibt nutzbar. Im Dashboard wird eine Fehlermeldung angezeigt, und die Wetter-Szene fällt auf den lokalen Standardzustand zurück."                                                                                                                                                                                                                                                                                                                                                       |
| Was ist euer Security-Nachweis?               | "Session-Cookie, Passwort-Hashing, Login-Lockout, Tests für unauthentifizierte Requests und npm Security Check im Quality Hub."                                                                                                                                                                                                                                                                                                                                                                    |
| Wie erfüllt ihr die Testpyramide?             | "Die Zuordnung steht in `docs/test-pyramid.md`: Backend-Unit- und Integrationstests, Frontend-Unit-Tests, ArchUnit, Security-nahe Controller-Tests und Playwright-E2E."                                                                                                                                                                                                                                                                                                                            |
| Wo sieht man Coverage?                        | "Im Quality Hub über JaCoCo für Backend und Vitest Coverage für Frontend."                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Warum eigener Quality Hub statt nur Terminal? | "Für die Abgabe ist es schneller prüfbar: ein Docker-Start, ein Dashboard, Links zu Logs und Reports."                                                                                                                                                                                                                                                                                                                                                                                             |
| Was würdet ihr als nächstes verbessern?       | "Als Nächstes würden wir vor allem das Produktgefühl ausbauen: ein schöneres, stärker animiertes UI, mehr Pokémon-Auswahl statt nur fester Starter und eine Sammelbox, in der man Pokémon horten kann, eventuell auch mit seltenen Shinies. Danach wären eigene Tasks spannend: Nutzer könnten Aufgaben selbst anlegen und dafür vorgefertigte Punkte-Templates wählen, damit die Gamification fair bleibt. Technisch kämen dann noch produktives Deployment-Hardening und besseres Caching dazu." |

## Aufteilung im Team

Wenn alle drei Personen sprechen, ist diese Aufteilung naheliegend:

| Rolle    | Abschnitt                                             |
| -------- | ----------------------------------------------------- |
| Person 1 | Einstieg, App-Idee und Live-Demo                      |
| Person 2 | Backend, API, Security und externer Wetter-Service    |
| Person 3 | Architektur, C4, ADRs, Tests, Quality Hub und Risiken |

Wenn am Ende eine Person einen Teil übernehmen muss, kann sie die drei Blöcke
in derselben Reihenfolge sprechen. Dann pro Abschnitt knapp bleiben und die
Live-Demo nicht zu lang machen.
