# Präsentations-Sprechzettel

Kurzfassung für die Präsentation. Nicht alles auswendig lernen. Lieber die
Reihenfolge sicher können und die Begriffe sauber treffen.
Wichtig ist die Reihenfolge: App zeigen, Qualitätsmodell erklären, Architektur begründen, Nachweise im Quality Hub zeigen.

## Einstieg

"Wir zeigen PokeHabit. Das ist eine kleine Self-Care-App. Nutzer melden sich an, erledigen tägliche 
Aufgaben, trinken Wasser und begleiten dadurch einen Pokémon-Partner. Wichtig war uns, dass das Projekt nicht nur hübsch aussieht,
sondern auch technisch nachweisbar funktioniert. Für uns war wichtig, Qualität nicht nur als 'fehlerfrei' zu verstehen, sondern konkret auf unseren Anwendungskontext zu beziehen."

"Deshalb haben wir Qualität mit ISO 25010, Kano und GQM eingeordnet. Unsere wichtigsten Qualitätsziele sind Funktionalität, Security, Wartbarkeit, Benutzbarkeit und Portabilität. Nachgewiesen wird das über Tests, Coverage, statische Analyse, Security-Checks, Architekturtests, CI und den Quality Hub."

## Demo-Reihenfolge

1. App öffnen: `http://localhost:3000`
2. Mit `demo / password123` einloggen.
3. Dashboard zeigen.
4. Eine Quest erledigen.
5. Wasser trinken.
6. Level-Up-Test zeigen.
7. Logout zeigen.
8. Kurz `http://localhost:8181/api/tasks` öffnen und sagen: "Das ist ein öffentlicher Endpunkt. Alles, was zum Nutzerzustand gehört, ist geschützt und hängt an der serverseitigen Session."

## Qualitätsmodell

"Qualität heißt bei uns nicht einfach: keine Fehler. Qualität heißt: Die App erfüllt die für 
PokeHabit wichtigen Eigenschaften. Bei ISO 25010 haben wir deshalb vor allem Funktionalität, Security, 
Wartbarkeit, Benutzbarkeit und Portabilität priorisiert."

"GQM übersetzt diese Ziele in konkrete Fragen: Funktionieren Login, Tasks und Wassertracking 
stabil? Sind geschützte Endpunkte wirklich geschützt? Bleibt die Architektur wartbar? Läuft das Projekt auf 
einem fremden Rechner reproduzierbar?"

"Die Antworten darauf liefern Tests, Coverage, Security-Checks, Architekturtests, CI und Dokumentation."

## Sonar und statische Analyse

"Hier ist unser Sonar- beziehungsweise Quality-Dashboard. Wichtig sind nicht nur einzelne Zahlen, 
sondern das Gate: Wir wollen mindestens 80 Prozent Coverage, keine kritischen Bugs, keine kritischen 
Vulnerabilities und geringe Duplikation."

"Statische Analyse ist bei uns kein Zusatztool am Ende. Sie gehört zum Qualitätsregelkreis: 
Soll-Werte stehen im Qualitätsmodell, Ist-Werte werden automatisch erhoben, und bei Abweichungen wird 
das Gate rot."

Guter Satz:

"Das ist nicht nur Doku. Das wird automatisch geprüft."

## API und Security

"Die Task-Liste ist öffentlich. Alles, was zum Nutzerzustand gehört, ist über
die Session geschützt. Passwörter werden gehasht gespeichert. Beim Login gibt es
außerdem Schutz gegen wiederholte Fehlversuche."

## Externer Service

"Als externen Service nutzen wir Open-Meteo für die Wetter-Szene im Dashboard.
Der `WeatherService` ruft über den `OpenMeteoWeatherAdapter` zuerst die
Geocoding-API für die eingegebene Stadt auf und lädt danach aktuelle
Wetterdaten. Daraus entstehen Wettercode, Temperatur und Tag/Nacht-Status für
die visuelle Szene. Wenn Open-Meteo nicht erreichbar ist, bleibt die App
nutzbar und zeigt eine verständliche Fehlermeldung beziehungsweise den lokalen
Standardzustand."

## Wetter-Resilienz

"Beim Wetter-Feature haben wir bewusst über Fehlerfälle gesprochen. Der WeatherService hat feste Timeouts: 
2 Sekunden für den Verbindungsaufbau und 4 Sekunden pro Request. Dadurch kann das Backend nicht dauerhaft 
blockieren, wenn Open-Meteo langsam oder nicht erreichbar ist."

"Wenn Open-Meteo ungültige oder unvollständige Daten liefert, 
nutzt der Service fachliche Defaults, zum Beispiel einen bewölkten Standardzustand und 0 Grad. 
Wenn Open-Meteo komplett nicht erreichbar ist oder einen Fehlerstatus liefert, wird das kontrolliert 
behandelt und als 502 zurückgegeben."

"Retry, Caching und Circuit Breaker wären sinnvolle nächste Schritte. Im aktuellen Stand sind sie aber 
nicht produktiv implementiert. Das sagen wir bewusst ehrlich."

## Architektur

"Im C4-Diagramm sieht man die Trennung: Angular-Frontend, Spring-Boot-Backend,
PostgreSQL und externe Dienste. Im Backend sind die Pakete nach
Features getrennt. Controller greifen nicht direkt auf Repositories zu; das
prüfen wir mit ArchUnit."
"Auf C1 sieht man Nutzer und Fremdsysteme. Auf C2 sieht man die deploybaren Container: Angular-Frontend, 
Spring-Boot-Backend, PostgreSQL und Quality Hub. Auf C3 sieht man die wichtigsten Backend-Komponenten."

"Unsere Architektur ist als vereinfachte hexagonale Architektur dokumentiert. 
Die fachliche Logik liegt im Core: Tasks, Wasser, Happiness und Pokémon-Fortschritt. 
REST Controller, PostgreSQL und Open-Meteo sind Adapter."

"Das Ziel ist: Die Businesslogik soll nicht direkt von REST, Datenbank oder externen APIs abhängen. 
Das macht sie besser testbar und wartbarer."


## Warum Angular statt React?

React wäre natürlich auch möglich gewesen. Der Vorteil von React ist die hohe
Flexibilität und das große Ökosystem. Genau diese Offenheit hätte für uns aber
mehr eigene Entscheidungen bedeutet: Routing, State-Struktur, Guards,
Formularansatz und Projektkonventionen müssten stärker selbst kombiniert
werden.

Angular war für diese Arbeit passender, weil das Framework Routing, Services,
Dependency Injection, Guards und TypeScript-Struktur direkt mitbringt. Das passt
gut zum SQS-Fokus: klare Zuständigkeiten, testbare Services und ein einheitlicher
Projektaufbau. Der Nachteil ist, dass Angular schwergewichtiger ist und Updates
mehr Anpassungsaufwand haben können. Für uns war die feste Struktur aber ein
bewusster Vorteil.

## C4 und PokeAPI sauber erklären

"Im aktuellen Laufzeitpfad ist Open-Meteo der externe Dienst. PokeAPI war ursprünglich Quelle für 
Pokémon-Stammdaten. Im normalen Betrieb liegen diese Daten aber in PostgreSQL und werden nicht live aus 
der PokeAPI geladen."

Guter Satz:

"Open-Meteo ist Laufzeitabhängigkeit, PokeAPI ist eher ursprüngliche Datenquelle für Seed- beziehungsweise 
Migrationsdaten."

## ArchUnit

"Die Architektur ist nicht nur gemalt. Wir sichern zentrale Regeln mit ArchUnit ab. Zum Beispiel sollen 
Controller nicht direkt auf Repositories zugreifen. Wenn jemand diese Trennung verletzt, fällt der 
Architekturtest auf."

## Testpyramide

"Unsere Testpyramide steht in der Doku. Unten liegen viele schnelle Unit-Tests für Services, Mapper, 
Fachlogik und Frontend-Komponenten. In der Mitte liegen Controller-, Security- und Integrationstests. 
Oben liegen wenige Playwright-Flows für zentrale Nutzerreisen."
"Die Zuordnung steht in `docs/04-quality/test-pyramid.md`: unten viele Unit-Tests, darüber
Controller-, Integrations-, Security- und Architekturtests, und oben wenige
Playwright-Flows."

"Wir testen nicht alles über E2E, weil E2E-Tests langsamer und anfälliger sind. Fachlogik testen wir unten 
schnell und stabil. E2E nutzen wir für die wichtigsten sichtbaren User-Flows."

## Quality

Checks nennen, nicht alle erklären:

- Backend-Tests und JaCoCo
- Checkstyle und SpotBugs
- Typecheck
- Frontend-Unit-Tests und Coverage
- ESLint
- npm Security
- Playwright E2E

Guter Satz:

"Für Prüfer ist das praktisch: ein Docker-Start, ein Dashboard, sichtbare Reports."

CI

"Zusätzlich zum lokalen Quality Hub laufen die Checks über GitHub Actions. Dadurch hängt Qualität 
nicht nur von einem lokalen Rechner ab. Änderungen werden automatisiert geprüft, bevor sie in den 
main-Branch gelangen."

## Doku

"Die Architektur ist in arc42 dokumentiert. Entscheidungen stehen in ADRs. Für
C4 gibt es eine Structurizr-DSL-Datei. ReadTheDocs ist im Repository vorbereitet
und kann nach dem Verbinden des öffentlichen Repos gebaut werden."

## Risiken ehrlich sagen

"Wir haben bewusst dokumentiert, was noch nicht produktionsfertig ist:
Deployment-Hardening, Caching für externe API-Daten und eine ausführlichere
Tageshistorie. Für die Abgabe liegt der Fokus auf lokalem Docker-Start,
funktionierender App und reproduzierbaren Quality Checks."

"Qualität bedeutet für uns auch Nachvollziehbarkeit: Man soll sehen können, warum wir Angular, Spring Boot, PostgreSQL und diese Architektur gewählt haben."

## Teamaufteilung
# Person 1 – App und Fachlichkeit, ca. 9–10 Minuten

"Ich übernehme Einstieg, App-Idee und Live-Demo. Ich zeige, dass Frontend, Backend und Datenbank wirklich zusammenspielen."

Reihenfolge:

App-Idee
Login
Dashboard
Quest
Wasser
Fortschritt
Logout
# Person 2 – API, Security und Wetter, ca. 8–9 Minuten

"Ich erkläre die API-Grenzen, Authentifizierung, Security-Nachweise und den externen Service Open-Meteo."

Reihenfolge:

öffentlicher /api/tasks-Endpunkt
geschützte User-State-Endpunkte
Passwort-Hashing und Login-Schutz
Open-Meteo-Ablauf
Timeouts, Defaults, 502
Grenzen: kein Retry, kein Circuit Breaker, kein produktives Caching
# Person 3 – Architektur und SQS-Nachweis, ca. 11–12 Minuten

"Ich zeige Architektur, C4, ADRs, Testpyramide, Quality Hub, CI und Risiken."

Reihenfolge:

C4 C1/C2/C3
hexagonale Architektur
ArchUnit
Testpyramide
Quality Hub
Sonar / Quality Gate
Dokumentation
Risiken
Abschluss

## Gute Antworten auf typische Fragen
# Warum Angular statt React?

"React wäre möglich gewesen und ist flexibler. Für uns war Angular passender, weil Routing, Services, Dependency Injection, Guards und TypeScript-Struktur direkt vom Framework vorgegeben werden. Das unterstützt Wartbarkeit, Teamkonventionen und Testbarkeit. Der Nachteil ist, dass Angular schwergewichtiger ist. Für diese SQS-Arbeit war die feste Struktur aber ein Vorteil."

# Ist PokeAPI eine Laufzeitabhängigkeit?

"Im aktuellen Stand nicht im normalen Laufzeitpfad. Die Pokémon-Stammdaten liegen in PostgreSQL. PokeAPI war die ursprüngliche Quelle für Seed- oder Migrationsdaten."

# Was passiert, wenn Open-Meteo nicht erreichbar ist?

"Der Request hat Timeouts. Bei unvollständigen Daten nutzt der Service Defaults. Bei kompletter Nichtverfügbarkeit oder Fehlerstatus wird kontrolliert ein 502 zurückgegeben. Die App bleibt grundsätzlich nutzbar."

# Warum keine Circuit Breaker?

"Das wäre eine sinnvolle Erweiterung. Für den aktuellen Semesterarbeitsumfang haben wir Timeouts und kontrollierte Fehlerbehandlung umgesetzt. Caching, Retry und Circuit Breaker sind dokumentierte nächste Schritte."

# Warum nicht nur E2E-Tests?

"E2E-Tests sind wertvoll, aber langsam und empfindlicher. Deshalb prüfen wir Fachlogik und API-Verhalten unten und in der Mitte der Pyramide. Playwright nutzen wir für wenige zentrale Nutzerflüsse."

# Wo sieht man Coverage?

"Backend-Coverage über JaCoCo, Frontend-Coverage über Vitest. Im Quality Hub und in der CI sind die Reports sichtbar."

# Was macht das Quality Gate rot?

"Fehlgeschlagene Tests, Typecheck-Fehler, Linting-Probleme, Security-Befunde, Coverage unter Zielwert oder Analysebefunde, die gegen unsere Qualitätsregeln verstoßen."


## Wenn eine Frage kommt und du kurz blockierst

1. Kurz auf den konkreten Nachweis zeigen.
2. Nicht anfangen zu raten.
3. Lieber sagen: "Das ist bei uns so umgesetzt: ..." und dann Code oder Doku zeigen.

## Sätze, die gut funktionieren

- "Das ist nicht nur Doku, das läuft im SonarQube wirklich durch."
- "Der externe Service ist Open-Meteo: Geocoding plus Forecast-Daten für die Wetter-Szene."
- "React wäre flexibler gewesen, Angular war für Struktur, Tests und Teamkonventionen passender."
- "Wenn die Wetter-API ausfällt, bleibt die App nutzbar und zeigt einen lokalen Standardzustand."
- "Die App ist per Docker startbar; "
- "Wir haben bekannte Grenzen dokumentiert, statt sie in der Präsentation zu verstecken."
- "Qualität ist bei uns nicht nur behauptet, sondern messbar gemacht."
- "Open-Meteo ist Laufzeitabhängigkeit; PokeAPI ist nur ursprüngliche Quelle für Stammdaten."
- "Die fachliche Logik liegt im Core, externe Systeme hängen über Adapter daran."
- "Wir haben bekannte Grenzen dokumentiert, statt sie in der Präsentation zu verstecken."


# Für die Abgabe zählt: lokal startbar, fachlich demonstrierbar, qualitätsgesichert nachvollziehbar."
## Abschluss

"Zusammengefasst zeigt PokeHabit drei Dinge: Erstens eine funktionierende App mit echtem Nutzerfluss. Zweitens eine nachvollziehbare Architektur mit klaren Grenzen. Drittens eine automatisierte Qualitätssicherung über Tests, Coverage, Security, statische Analyse, CI und Quality Hub."

"Damit ist Softwarequalität bei uns nicht nur ein Anspruch, sondern ein sichtbarer Nachweis."


