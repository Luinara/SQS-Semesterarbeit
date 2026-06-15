# Präsentationsablauf

Ziel: In 15 Minuten zeigen, dass PokeHabit als App funktioniert und dass die
Softwarequalität nicht nur behauptet, sondern automatisiert nachgewiesen wird.

## Vorbereitung vor der Präsentation

1. Docker starten:

   ```bash
   docker compose --profile quality up --build
   ```

2. Browser-Tabs öffnen:

   | Tab | URL | Zweck |
   | --- | --- | --- |
   | App | `http://localhost:3000` | Live-Demo |
   | Backend | `http://localhost:8181/api/tasks` | öffentlicher REST-Endpunkt |
   | Quality Hub | `http://localhost:8088` | Tests, Coverage, Security, E2E |
   | Doku | ReadTheDocs-URL oder lokale `docs/index.md` | arc42, ADRs, C4 |
   | C4 | `docs/diagrams/c4-diagram.md` | Architekturüberblick |

3. Demo-Login bereithalten:

   ```text
   demo / password123
   ```

4. Fallback, falls Live-Docker hakt:

   - Quality Hub Screenshot oder letzter Report aus dem Docker-Volume zeigen.
   - C4-Diagramm und Testkonzept aus der Doku zeigen.
   - Kurz sagen: "Die App ist dockerisiert; wenn der Live-Start auf dem Vorführrechner hängt, zeigen wir den letzten lokal erzeugten Quality-Report."

## 15-Minuten-Ablauf

| Zeit | Inhalt | Was zeigen | Kernaussage |
| --- | --- | --- | --- |
| 0:00 - 1:00 | Einstieg | App-Startseite oder Dashboard | "PokeHabit verbindet kleine Self-Care-Aufgaben mit einem Pokemon-Partner." |
| 1:00 - 3:30 | Live-Demo Nutzerfluss | Registrierung/Login, Dashboard, Quest, Wasser, Training, Logout | "Die App ist nicht nur ein Mockup; Frontend und Backend sprechen über echte REST-Endpunkte." |
| 3:30 - 5:00 | API und Security | `/api/tasks`, geschützter Game-State, Session-Cookie erklären | "Es gibt öffentliche und geschützte Endpunkte, Passwörter werden gehasht, Sessions laufen serverseitig." |
| 5:00 - 6:30 | Externer Service | ADR-004 oder Code `PokeApiPokemonService` | "Das Backend nutzt PokeAPI für Starter-Pokemon und fällt bei Fehlern lokal zurück." |
| 6:30 - 8:30 | Architektur | C4-Diagramm + Structurizr-DSL | "Das System ist in Frontend, Backend, Persistenz, externe Dienste und Quality Hub getrennt." |
| 8:30 - 11:30 | Testkonzept | Quality Hub | "Der Quality Hub bündelt Backend-Tests, Checkstyle, SpotBugs, Typecheck, Unit-Tests, Coverage, Lint, Security und E2E." |
| 11:30 - 13:00 | Doku und Entscheidungen | arc42, ADRs, ReadTheDocs | "Die wichtigsten Architekturentscheidungen sind nachvollziehbar dokumentiert." |
| 13:00 - 14:30 | Risiken und Grenzen | arc42 Risiken | "Wir benennen bewusst Grenzen: Deployment-Hardening, externe APIs, Tageshistorie." |
| 14:30 - 15:00 | Abschluss | Quality Hub oder App | "Das Projekt ist per Docker startbar und die Qualitätssicherung ist reproduzierbar." |

## Sprechtext pro Abschnitt

### Einstieg

"Wir zeigen PokeHabit, eine kleine Self-Care-Web-App. Nutzer erledigen tägliche
Aufgaben, trinken Wasser und trainieren dadurch einen Pokemon-Partner. Für die
Semesterarbeit war uns wichtig, nicht nur eine Oberfläche zu bauen, sondern den
Qualitätsnachweis lokal sichtbar zu machen."

### Live-Demo

"Ich logge mich mit dem Demo-User ein. Das Dashboard lädt den Nutzerzustand aus
dem Backend. Wenn ich eine Quest abschließe oder Wasser trinke, geht das über
die API zurück ins Backend und wird persistiert. Das Training verändert XP,
Level und später auch die Entwicklung des Pokemon."

### API und Security

"Ein Teil der API ist öffentlich, zum Beispiel die Task-Liste. Nutzerbezogene
Aktionen sind geschützt und laufen über eine serverseitige Session. Passwörter
werden nicht im Klartext gespeichert. Für Login gibt es zusätzlich Schutz gegen
wiederholte Fehlversuche."

### Externer Service

"Die Checkliste verlangt einen externen Service im Backend. Dafür nutzt unser
Backend PokeAPI beim Anlegen der Starter-Pokemon. Der Zugriff hat kurze Timeouts
und einen lokalen Fallback. Wenn PokeAPI nicht antwortet, kann sich der Nutzer
trotzdem registrieren."

### Architektur

"Im C4-Modell sieht man die Grenzen des Systems: Browser, Angular-Frontend,
Spring-Boot-Backend, PostgreSQL und externe Dienste. Die Backend-Komponenten
sind nach Feature-Packages getrennt. Controller greifen nicht direkt auf
Repositories zu; das prüfen wir auch mit ArchUnit."

### Quality Hub

"Qualitätssicherung sollte bei uns nicht nur als Liste in der Doku stehen,
sondern als zusammenhängende Lösung im Projekt sichtbar sein. Deshalb gibt es
den Quality Hub: Er prüft, ob die Checks wirklich ausgeführt wurden, sammelt die
wichtigen Reports und macht das Ergebnis direkt sichtbar. Pflichtchecks machen
das Gate rot, wenn Tests, Security, Typecheck, Lint oder Backend-Analyse
fehlschlagen."

### Doku und ADRs

"Die Architektur ist in arc42 dokumentiert. Wichtige Entscheidungen stehen als
ADRs im Repository, zum Beispiel Spring Boot, PostgreSQL, Angular und PokeAPI.
Die ReadTheDocs-Konfiguration liegt im Repository, damit die Doku öffentlich
gebaut werden kann."

### Risiken

"Wir haben bekannte Grenzen dokumentiert. Für einen echten Produktivbetrieb
müssten Cookie-Secure-Flags, Deployment-Hardening und externe API-Caches noch
ausgebaut werden. Für die Semesterarbeit ist der lokale Docker-Start und der
Quality-Nachweis der relevante Fokus."

## Mögliche Fragen und gute Antworten

| Frage | Antwort |
| --- | --- |
| Warum Angular statt React? | "Angular passt hier gut, weil Routing, Services, Guards und TypeScript-Struktur direkt im Framework liegen. Das hilft bei Testbarkeit und klarer Trennung." |
| Wo ist der externe Service? | "`PokeApiPokemonService` im Backend ruft PokeAPI auf. Der Ausfall ist durch Fallback und Tests abgesichert." |
| Was passiert, wenn PokeAPI down ist? | "Registrierung funktioniert weiter. Das Backend nutzt den lokalen Starter-Katalog." |
| Was ist euer Security-Nachweis? | "Session-Cookie, Passwort-Hashing, Login-Lockout, Tests für unauthentifizierte Requests und npm Security Check im Quality Hub." |
| Wie erfüllt ihr die Testpyramide? | "Backend-Unit- und Integrationstests, Frontend-Unit-Tests, ArchUnit, Security-nahe Controller-Tests und Playwright-E2E." |
| Wo sieht man Coverage? | "Im Quality Hub über JaCoCo für Backend und Vitest Coverage für Frontend." |
| Warum eigener Quality Hub statt nur Terminal? | "Für die Abgabe ist es schneller prüfbar: ein Docker-Start, ein Dashboard, Links zu Logs und Reports." |
| Was würdet ihr als nächstes verbessern? | "Read-only Historie für Tagesfortschritt, Caching für externe API-Daten und produktives Deployment-Hardening." |

## Aufteilung im Team

Wenn alle sprechen müssen, ist diese Aufteilung naheliegend:

| Rolle | Abschnitt |
| --- | --- |
| Person 1 | Einstieg und Live-Demo |
| Person 2 | Backend, API, Security, externer Service |
| Person 3 | Architektur, C4, ADRs |
| Person 4 | Tests, Quality Hub, Risiken |

Wenn am Ende nur eine Person sicher vorbereitet ist, kann dieselbe Struktur
auch allein gesprochen werden. Dann pro Abschnitt eher knapp bleiben und die
Live-Demo nicht zu lang machen.
