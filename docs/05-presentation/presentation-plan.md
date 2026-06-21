# Präsentationsablauf

Ziel: In 30 Minuten zeigen, dass PokeHabit als App funktioniert und dass die
Softwarequalität nicht nur behauptet, sondern automatisiert, dokumentiert und
nachvollziehbar nachgewiesen wird.

Der Ablauf ist bewusst nicht nur eine verlängerte 15-Minuten-Version. Die
zusätzliche Zeit wird genutzt, um die Live-Demo ruhiger zu zeigen, Architektur-
und Qualitätsentscheidungen besser zu begründen und am Ende typische Rückfragen
souverän beantworten zu können.

## Vorbereitung vor der Präsentation

1. Docker starten:

   ```bash
   docker compose --profile quality up --build
   ```

2. Browser-Tabs öffnen:

   | Tab          | URL                                           | Zweck                          |
      | ------------ | --------------------------------------------- | ------------------------------ |
   | App          | `http://localhost:3000`                       | Live-Demo                      |
   | Backend      | `http://localhost:8181/api/tasks`             | öffentlicher REST-Endpunkt     |
   | Quality Hub  | `http://localhost:8088`                       | Tests, Coverage, Security, E2E |
   | Testpyramide | `docs/04-quality/test-pyramid.md`             | SQS-Testnachweis               |
   | Testkonzept  | `docs/04-quality/test-concept.md`             | dokumentiertes Testvorgehen    |
   | Doku         | ReadTheDocs-URL oder lokale `docs/index.md`   | arc42, ADRs, C4                |
   | C4           | `docs/02-architecture/diagrams/c4-diagram.md` | Architekturüberblick           |
   | ADRs         | `docs/09-architecture-decisions/`             | Architekturentscheidungen      |

3. Demo-Login bereithalten:

   ```text
   demo / password123
   ```

4. Vorher prüfen:

   - App lädt unter `http://localhost:3000`.
   - Login mit Demo-User funktioniert.
   - `/api/tasks` ist im Browser erreichbar.
   - Quality Hub zeigt aktuelle oder zuletzt erzeugte Reports.
   - Playwright-, Backend-, Frontend- und Security-Checks sind sichtbar.
   - Doku-Seiten und Diagramme sind lokal oder online erreichbar.

5. Fallback, falls Live-Docker hakt:

   - Quality-Hub-Screenshot oder letzter Report aus dem Docker-Volume zeigen.
   - C4-Diagramm und Testkonzept aus der Doku zeigen.
   - Kurz sagen:  
     "Die App ist dockerisiert; wenn der Live-Start auf dem Vorführrechner
     hängt, zeigen wir den letzten lokal erzeugten Quality-Report. Entscheidend
     ist, dass Build, Tests und Reports reproduzierbar über denselben
     Docker-Start erzeugt werden."

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

## Empfohlene Gewichtung

Für 30 Minuten sollte die Präsentation ungefähr so wirken:

| Bereich                    | Zeitanteil  | Warum                                                               |
| -------------------------- |-------------|---------------------------------------------------------------------|
| App und Fachlichkeit       | ca. 10 min  | Zeigt, dass ein nutzbares Produkt entstanden ist.                   |
| Architektur und Design     | ca. 6 min   | Zeigt technische Struktur, Wartbarkeit und bewusste Entscheidungen. |
| Qualitätssicherung         | ca. 8 min   | Wichtigster SQS-Schwerpunkt: Tests, Coverage, Security, Reports.    |
| Doku, Risiken, Abschluss   | ca. 4 min   | Zeigt Reflexion und Nachvollziehbarkeit.                            |
| Puffer für Übergänge       | ca. 2 min   | Verhindert Hektik bei Tabwechseln oder kurzen Rückfragen.           |

## Sprechtext pro Abschnitt

### Einstieg

"Wir zeigen PokeHabit, eine kleine Self-Care-Web-App. Nutzer erledigen tägliche
Aufgaben, trinken Wasser und begleiten dadurch einen Pokémon-Partner. Für die
Semesterarbeit war uns wichtig, nicht nur eine Oberfläche zu bauen, sondern den
Qualitätsnachweis lokal sichtbar zu machen. Deshalb besteht das Projekt nicht
nur aus Frontend, Backend und Datenbank, sondern auch aus einem Quality Hub, der
Tests, Coverage, Security-Checks und E2E-Ergebnisse bündelt."

### Live-Demo

"Ich logge mich mit dem Demo-User ein. Das Dashboard lädt den Nutzerzustand aus
dem Backend. Wenn ich eine Quest abschließe oder Wasser trinke, geht das über
die API zurück ins Backend und wird persistiert. Quest-Fortschritt verändert XP,
Level und später auch die Entwicklung des Pokémon.

Wichtig ist hier: Die Oberfläche zeigt nicht nur statische Daten. Die Aktionen
lösen echte Requests aus. Dadurch können wir die Anwendung auch auf mehreren
Ebenen testen: einzelne Logik im Backend, Controller-Verhalten über MockMvc,
Frontend-Komponenten mit Vitest und echte User-Flows mit Playwright."

### Fachliche Logik

"Die App hat bewusst einen kleinen, aber vollständigen fachlichen Kern:
Tagesquests, Wassertracking, XP, Level und Pokémon-Fortschritt. Diese Logik ist
überschaubar genug für eine Semesterarbeit, aber komplex genug, um sinnvolle
Tests zu rechtfertigen. Wir können prüfen, ob Punkte korrekt vergeben werden,
ob abgeschlossene Aufgaben nicht doppelt zählen und ob der Nutzerzustand nach
einem Request konsistent bleibt."

### API und Security

"Ein Teil der API ist öffentlich, zum Beispiel die Task-Liste. Nutzerbezogene
Aktionen sind geschützt und laufen über eine serverseitige Session. Passwörter
werden nicht im Klartext gespeichert, sondern gehasht. Für Login gibt es
zusätzlich Schutz gegen wiederholte Fehlversuche.

Für den SQS-Nachweis ist wichtig, dass Security nicht nur beschrieben wird. Wir
haben Tests, die unauthentifizierte Requests gegen geschützte Endpunkte prüfen.
Außerdem werden Dependency- beziehungsweise npm-Security-Checks im Quality Hub
sichtbar gemacht."

### Externer Service

"Als externen Service nutzen wir Open-Meteo für die Wetter-Szene im Dashboard.
Der `WeatherService` ruft über den `OpenMeteoWeatherAdapter` zuerst die
Geocoding-API für eine eingegebene Stadt auf und lädt danach aktuelle
Wetterdaten wie Temperatur, Wettercode und Tag/Nacht. Diese Daten werden in
eine sichtbare Szene gemappt, also zum Beispiel Sonne, Regen, Schnee, Nebel
oder Nachtstimmung.

Die Kopplung an den externen Dienst ist bewusst gekapselt. Wenn der Dienst nicht
erreichbar ist, bleibt die App nutzbar und zeigt eine verständliche
Fehlermeldung beziehungsweise den lokalen Standardzustand. Dadurch hängt der
fachliche Kern der App nicht vollständig von einer externen API ab."

### Architektur

"Im C4-Modell sieht man die Grenzen des Systems: Browser, Angular-Frontend,
Spring-Boot-Backend, PostgreSQL und externe Dienste. Zusätzlich gibt es den
Quality Hub als eigenständigen Bestandteil für die Qualitätssicherung.

Die Backend-Komponenten sind nach Feature-Packages getrennt. Controller greifen
nicht direkt auf Repositories zu; dazwischen liegen Services. Diese Trennung ist
nicht nur eine Konvention, sondern wird mit ArchUnit abgesichert. Dadurch
unterstützt die Architektur unsere Qualitätsziele: Testbarkeit, Wartbarkeit und
klare Verantwortlichkeiten."

### Architekturentscheidung Angular statt React

"React wäre für die App grundsätzlich auch möglich gewesen. Dagegen sprach für
uns, dass React sehr viel Architekturentscheidung offenlässt: Routing,
Formularstruktur, State-Management, Guards und Projektkonventionen müssten
stärker selbst zusammengestellt werden. Das ist flexibel, erhöht bei einer
Semesterarbeit aber auch das Risiko, dass die App aus vielen einzelnen
Bibliotheken und Team-Konventionen besteht.

Angular passte für unser Ziel besser, weil Routing, Services, Guards,
Dependency Injection, TypeScript und Teststruktur direkt im Framework liegen.
Dadurch konnten wir die App feature-orientiert aufbauen, HTTP-Zugriffe in
Services kapseln und Zuständigkeiten klarer trennen. Der Nachteil ist, dass
Angular schwergewichtiger ist und Updates eher Breaking Changes mitbringen
können. Für unseren SQS-Fokus war diese Strenge aber eher ein Vorteil, weil sie
Wartbarkeit, Testbarkeit und einheitliche Struktur unterstützt."

### Testkonzept und Testpyramide

"Für die Abgabe wollten wir die Testpyramide nicht nur behaupten. In der Doku
ordnen wir die Tests nach Ebene ein: Unit-Tests, Controller- und
Integrationstests, Security-nahe Tests, ArchUnit und Playwright.

Die unteren Ebenen der Pyramide enthalten viele schnelle Tests. Sie prüfen
fachliche Logik, Services und Komponenten. Darüber liegen Integrationstests, die
das Zusammenspiel von Controller, Service und Persistenz prüfen. Security-nahe
Tests prüfen, ob geschützte Endpunkte wirklich geschützt sind. ArchUnit prüft
Architekturregeln. Playwright deckt wenige, aber wichtige echte User-Flows ab.

Diese Struktur ist wichtig, weil E2E-Tests zwar sehr aussagekräftig, aber auch
teurer und empfindlicher sind. Deshalb liegt der Schwerpunkt unten in der
Pyramide, während Playwright die wichtigsten End-to-End-Szenarien ergänzt."

### Quality Hub

"Der Quality Hub ist unser sichtbarer Nachweis für die Qualitätssicherung. Er
führt die Checks aus, sammelt Reports und macht das Ergebnis direkt sichtbar.
Dazu gehören Backend-Tests mit JaCoCo-Coverage, Frontend-Tests mit
Vitest-Coverage, Typecheck, Linting, Security-Checks, ArchUnit und
Playwright-E2E.

Pflichtchecks machen das Gate rot, wenn wichtige Qualitätskriterien fehlschlagen.
Dadurch ist der Quality Hub mehr als eine hübsche Übersichtsseite: Er ist ein
lokaler Prüfpunkt für die Abgabe. Prüfer können schneller sehen, welche Checks
existieren, ob sie laufen und wo die Reports liegen."

### CI und Reproduzierbarkeit

"Zusätzlich zum lokalen Docker-Start ist die CI wichtig. Sie verhindert, dass
Qualität nur auf einem einzelnen Rechner funktioniert. GitHub Actions führt die
relevanten Checks automatisiert aus. Der Docker-Quality-Hub ist dabei besonders
für die Präsentation und lokale Prüfung nützlich, weil er Ergebnisse gebündelt
sichtbar macht."

### Doku und ADRs

"Die Architektur ist in arc42 dokumentiert. Wichtige Entscheidungen stehen als
ADRs im Repository, zum Beispiel Spring Boot, PostgreSQL und Angular. Die
ReadTheDocs-Konfiguration liegt im Repository, damit die Doku öffentlich gebaut
werden kann.

Das ist für SQS wichtig, weil Qualität nicht nur aus Tests besteht. Qualität
heißt auch, dass Entscheidungen nachvollziehbar sind, Risiken benannt werden und
neue Teammitglieder verstehen können, warum das System so aufgebaut wurde."

### Risiken

"Wir haben bekannte Grenzen dokumentiert. Für einen echten Produktivbetrieb
müssten Cookie-Secure-Flags, Deployment-Hardening, Monitoring, Backups und
Caching externer APIs noch ausgebaut werden. Für die Semesterarbeit ist der
lokale Docker-Start und der reproduzierbare Quality-Nachweis der relevante
Fokus.

Wichtig ist: Diese Grenzen sind nicht versteckt, sondern bewusst dokumentiert.
Damit zeigen wir, dass wir zwischen Semesterarbeitsumfang und Produktivbetrieb
unterscheiden können."

### Abschluss

"Zusammengefasst zeigt PokeHabit drei Dinge: Erstens eine funktionierende App
mit echtem Nutzerfluss. Zweitens eine nachvollziehbare Architektur mit klaren
Grenzen und dokumentierten Entscheidungen. Drittens eine automatisierte
Qualitätssicherung, die über Docker und CI reproduzierbar ist. Damit ist die
Softwarequalität nicht nur behauptet, sondern sichtbar nachgewiesen."

## Mögliche Fragen und gute Antworten

| Frage | Antwort |
| ----- | ------- |
| Warum Angular statt React? | "React wäre möglich gewesen und ist flexibler. Dagegen sprach für uns, dass React Routing, State-Struktur, Guards, Formularansatz und Projektkonventionen stärker offenlässt. Für eine SQS-Semesterarbeit hätte das mehr Bibliotheksauswahl und mehr Team-Konventionen bedeutet. Angular bringt diese Struktur direkter mit, was für Testbarkeit, Teamarbeit und klare Trennung besser gepasst hat." |
| Was ist das Gegenargument gegen Angular? | "Angular ist schwergewichtiger als React und Updates können mehr Anpassungen erzwingen. Wir haben das bewusst akzeptiert, weil die feste Struktur für SQS, Teamarbeit und Dokumentation mehr Nutzen gebracht hat als maximale UI-Flexibilität." |
| Wo ist der externe Service? | "`WeatherService` im Frontend nutzt den `OpenMeteoWeatherAdapter`. Der Adapter ruft Open-Meteo Geocoding für die Stadt und danach die Forecast-API für Temperatur, Wettercode und Tag/Nacht ab." |
| Was passiert, wenn die Wetter-API down ist? | "Die App bleibt nutzbar. Im Dashboard wird eine Fehlermeldung angezeigt, und die Wetter-Szene fällt auf den lokalen Standardzustand zurück." |
| Was ist euer Security-Nachweis? | "Session-Cookie, Passwort-Hashing, Login-Lockout, Tests für unauthentifizierte Requests und npm Security Check im Quality Hub." |
| Wie erfüllt ihr die Testpyramide? | "Die Zuordnung steht in `docs/04-quality/test-pyramid.md` und wird im Testkonzept ergänzt: Backend-Unit- und Integrationstests, Frontend-Unit-Tests, ArchUnit, Security-nahe Controller-Tests und Playwright-E2E." |
| Wo sieht man Coverage? | "Im Quality Hub über JaCoCo für Backend und Vitest Coverage für Frontend." |
| Warum eigener Quality Hub statt nur Terminal? | "Für die Abgabe ist es schneller prüfbar: ein Docker-Start, ein Dashboard, Links zu Logs und Reports. Das reduziert Erklärungsaufwand und macht Qualität sichtbarer." |
| Warum nicht nur E2E-Tests? | "E2E-Tests sind wichtig, aber langsam und empfindlicher. Deshalb prüfen wir die meiste Logik auf Unit- und Integrationsebene und nutzen Playwright für wenige zentrale User-Flows." |
| Was prüft ArchUnit? | "ArchUnit prüft Architekturregeln, zum Beispiel dass Controller nicht direkt auf Repositories zugreifen. Dadurch wird die dokumentierte Schichtung technisch abgesichert." |
| Wie geht ihr mit externen APIs um? | "Der externe Wetterdienst ist gekapselt. Die App bleibt nutzbar, wenn der Dienst nicht erreichbar ist. Für Tests werden externe Aufrufe kontrolliert beziehungsweise ersetzt." |
| Ist das produktionsreif? | "Nicht vollständig. Für Produktion fehlen noch Hardening, Monitoring, Backups, Secrets-Management und robustere Caching-Strategien. Für die Semesterarbeit liegt der Fokus auf lokal reproduzierbarer App, Architektur und Qualitätssicherung." |
| Was würdet ihr als nächstes verbessern? | "Als Nächstes würden wir vor allem das Produktgefühl ausbauen: ein schöneres, stärker animiertes UI, mehr Pokémon-Auswahl statt nur fester Starter und eine Sammelbox, in der man Pokémon horten kann, eventuell auch mit seltenen Shinies. Danach wären eigene Tasks spannend: Nutzer könnten Aufgaben selbst anlegen und dafür vorgefertigte Punkte-Templates wählen, damit die Gamification fair bleibt. Technisch kämen dann noch produktives Deployment-Hardening, besseres Caching und Monitoring dazu." |

## Aufteilung im Team

Wenn alle drei Personen sprechen, ist diese Aufteilung für 30 Minuten
naheliegend:

| Rolle    | Abschnitt                                                 | Zeit       |
|----------|-----------------------------------------------------------|------------|
| Person 1 | Einstieg, App-Idee, Live-Demo und fachliche Logik         | ca. 10 min |
| Person 2 | Backend, API, Security und externer Wetter-Service        | ca. 8 min  |
| Person 3 | Architektur, C4, ADRs, Tests, Quality Hub, CI und Risiken | ca. 12 min |

Alternative mit stärkerer SQS-Gewichtung:

| Rolle    | Abschnitt                                           | Zeit       |
| -------- |-----------------------------------------------------|------------|
| Person 1 | App-Idee, Nutzerfluss, fachlicher Kern              | ca. 8 min  |
| Person 2 | Architektur, API, Security, externer Service        | ca. 9 min  |
| Person 3 | Testkonzept, Testpyramide, Quality Hub, CI, Risiken | ca. 13 min |

Wenn am Ende eine Person einen Teil übernehmen muss, kann sie die drei Blöcke
in derselben Reihenfolge sprechen. Bei 30 Minuten sollte die Live-Demo trotzdem
nicht zu lang werden. Der wichtigste Bewertungspunkt ist nicht nur, dass die App
funktioniert, sondern dass die Qualitätssicherung sichtbar, begründet und
reproduzierbar ist.

## Hinweise für eine starke 30-Minuten-Präsentation

- Nicht jede Datei vollständig erklären. Lieber gezielt zeigen, wo die Nachweise
  liegen.
- Bei der Live-Demo langsam sprechen und sichtbar machen, wann Frontend,
  Backend und Datenbank zusammenspielen.
- Bei Tests nicht nur sagen "wir haben Tests", sondern je Ebene ein konkretes
  Beispiel nennen.
- Bei Quality Hub erklären, welche Checks Pflichtchecks sind und warum ein rotes
  Gate relevant wäre.
- Risiken nicht defensiv formulieren. Besser: "Das ist bewusst dokumentiert und
  außerhalb des Semesterarbeitsumfangs."
- Am Ende auf die Kernbotschaft zurückkommen: funktionierende App,
  nachvollziehbare Architektur, reproduzierbare Qualitätssicherung.
