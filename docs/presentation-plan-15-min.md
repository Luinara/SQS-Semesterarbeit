# Präsentationsablauf

Ziel: In 15 Minuten zeigen, dass PokeHabit als App funktioniert und dass die
Softwarequalität nicht nur behauptet, sondern automatisiert nachgewiesen wird.

## Vorbereitung vor der Präsentation

1. Docker starten:

   ```bash
   docker compose --profile quality up --build
   ```

2. Browser-Tabs öffnen:

   | Tab          | URL                                                                    | Zweck                           |
   |--------------|------------------------------------------------------------------------|---------------------------------|
   | App          | `http://localhost:3000`                                                | Live-Demo                       |
   | Backend      | `http://localhost:8181/api/tasks`                                      | öffentlicher REST-Endpunkt      |
   | SonarQube    | `https://sonarcloud.io/project/overview?id=Luinara_SQS-Semesterarbeit` | Tests, Coverage, Security, E2E  |
   | Testpyramide | `docs/test-pyramid.md`                                                 | SQS-Testnachweis                |
   | Doku         | ReadTheDocs-URL oder lokale `docs/index.md`                            | arc42, ADRs, C4                 |
   | C4           | `docs/diagrams/c4-diagram.md`                                          | Architekturüberblick            |

3. Demo-Login bereithalten:

   ```text
   demo / password123
   ```

4. Fallback, falls Live-Docker hakt:
   - SonarQube Screenshot oder letzter Report zeigen.
   - C4-Diagramm und Testkonzept aus der Doku zeigen.
   - Kurz sagen: "Die App ist dockerisiert; wenn der Live-Start auf dem Vorführrechner hängt, zeigen wir den letzten lokal erzeugten Quality-Report."

## 15-Minuten-Ablauf

| Zeit          | Inhalt                  | Was zeigen                                                                     | Kernaussage                                                                                                                           |
|---------------|-------------------------|--------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| 0:00 - 1:00   | Einstieg                | App-Startseite oder Dashboard                                                  | "PokeHabit verbindet kleine Self-Care-Aufgaben mit einem Pokémon-Partner."                                                            |
| 1:00 - 3:30   | Live-Demo Nutzerfluss   | Registrierung/Login, Dashboard, Quest, Wasser, Level-Up-Test, Logout           | "Die App ist nicht nur ein Mockup; Frontend und Backend sprechen über echte REST-Endpunkte."                                          |
| 3:30 - 5:00   | API und Security        | `/api/tasks`, geschützter Game-State, Session-Cookie erklären                  | "Es gibt öffentliche und geschützte Endpunkte, Passwörter werden gehasht, Sessions laufen serverseitig."                              |
| 5:00 - 6:30   | Externer Service        | Wetter-Szene im Dashboard oder Code `WeatherService` / `BackendWeatherAdapter` | "Die App nutzt Open-Meteo für echte Wetterdaten und passt die Dashboard-Szene daran an."                                              |
| 6:30 - 8:30   | Architektur             | C4-Diagramm + Structurizr-DSL                                                  | "Das System ist in Frontend, Backend, Persistenz und externe Dienste getrennt."                                                       |
| 8:30 - 11:30  | Testkonzept             | Testpyramide + Quality Runner + SonarQube                                      | "Die Testpyramide ordnet Unit-, Integrations-, Security-, Architektur- und E2E-Tests ein."                                            |
| 11:30 - 13:00 | Doku und Entscheidungen | arc42, ADRs, ReadTheDocs                                                       | "Die wichtigsten Architekturentscheidungen sind nachvollziehbar dokumentiert."                                                        |
| 13:00 - 14:30 | Risiken und Grenzen     | arc42 Risiken                                                                  | "Wir benennen bewusst Grenzen: Deployment-Hardening, externe APIs, Tageshistorie."                                                    |
| 14:30 - 15:00 | Abschluss               | App                                                                            | "Das Projekt ist per Docker startbar und die Qualitätssicherung ist reproduzierbar."                                                  |

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
Das Frontend ruft `/api/weather/location` und `/api/weather/current` auf. Der Backend-`WeatherService` ruft serverseitig zuerst die
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

| Frage                                       | Antwort                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Warum Angular statt React?                  | "React wäre möglich gewesen und ist flexibler. Dagegen sprach für uns, dass React Routing, State-Struktur, Guards, Formularansatz und Projektkonventionen stärker offenlässt. Angular bringt diese Struktur direkter mit, was für Testbarkeit, Teamarbeit und klare Trennung in dieser Semesterarbeit besser gepasst hat."                                                                                                                                                                         |
| Wo ist der externe Service?                 | "Das Frontend nutzt `/api/weather/location` und `/api/weather/current`. Im Backend ruft `WeatherService` Open-Meteo Geocoding und Forecast auf und liefert den gemappten Wetter-Snapshot ans Dashboard."                                                                                                                                                                                                                                                                                           |
| Was passiert, wenn die Wetter-API down ist? | "Die App bleibt nutzbar. Im Dashboard wird eine Fehlermeldung angezeigt, und die Wetter-Szene fällt auf den lokalen Standardzustand zurück."                                                                                                                                                                                                                                                                                                                                                       |
| Was ist euer Security-Nachweis?             | "Session-Cookie, Passwort-Hashing, Login-Lockout, Tests für unauthentifizierte Requests und npm Security Check."                                                                                                                                                                                                                                                                                                                                                                                   |
| Wie erfüllt ihr die Testpyramide?           | "Die Zuordnung steht in `docs/test-pyramid.md`: Backend-Unit- und Integrationstests, Frontend-Unit-Tests, ArchUnit, Security-nahe Controller-Tests und Playwright-E2E."                                                                                                                                                                                                                                                                                                                            |
| Wo sieht man Coverage?                      | "Im SonarQube über JaCoCo für Backend und Vitest Coverage für Frontend."                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Was würdet ihr als nächstes verbessern?     | "Als Nächstes würden wir vor allem das Produktgefühl ausbauen: ein schöneres, stärker animiertes UI, mehr Pokémon-Auswahl statt nur fester Starter und eine Sammelbox, in der man Pokémon horten kann, eventuell auch mit seltenen Shinies. Danach wären eigene Tasks spannend: Nutzer könnten Aufgaben selbst anlegen und dafür vorgefertigte Punkte-Templates wählen, damit die Gamification fair bleibt. Technisch kämen dann noch produktives Deployment-Hardening und besseres Caching dazu." |

## Aufteilung im Team

Wenn alle drei Personen sprechen, ist diese Aufteilung naheliegend:

| Rolle    | Abschnitt                                           |
|----------|-----------------------------------------------------|
| Person 1 | Einstieg, App-Idee und Live-Demo                    |
| Person 2 | Backend, API, Security und externer Wetter-Service  |
| Person 3 | Architektur, C4, ADRs, Tests und Risiken            |

Wenn am Ende eine Person einen Teil übernehmen muss, kann sie die drei Blöcke
in derselben Reihenfolge sprechen. Dann pro Abschnitt knapp bleiben und die
Live-Demo nicht zu lang machen.
