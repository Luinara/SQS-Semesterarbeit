# Daily-Reset-Testfaelle

## Ziel

Nachweisen, dass das Frontend nach Ablauf des konfigurierten Reset-Intervalls
den neuen Backend-Spielstand korrekt darstellt:

- Wasser-Buttons sind wieder aktiv.
- erledigte Quest-Buttons werden wieder zu offenen `Erledigen`-Buttons.
- der Wasserstand steht wieder bei `0 / 3000 ml`.
- die Anmelde-Serie bleibt am selben UTC-Tag unveraendert.

Wichtig: Der Reset wird nicht durch einen neuen Login ausgeloest. Der Server
bewertet den Reset beim Abruf von `GET /api/user/game-state`; das Frontend laedt
den Spielstand waehrend einer laufenden Session regelmaessig neu.

## Automatisierter Nachweis

### Backend-JUnit

Der Service-Test
`backend/src/test/java/io/github/luinara/sqs/user/UserServiceTest.java`
enthaelt den technischen Nachweis fuer das kurze Reset-Intervall:

- `getGameState_resetsDailyProgress_afterConfiguredIntervalWithoutNewLogin`
  instanziiert `UserService` mit `Duration.ofMinutes(1)`.
- Der Test setzt `lastLoginAt` auf `2026-06-16T10:00:00Z` und die feste
  Test-Clock auf `2026-06-16T10:01:00Z`.
- Erwartet wird, dass `waterLevel` auf `0` faellt,
  `lastDailyResetAt` gesetzt wird, `resetCompletionsByUserId(...)`
  aufgerufen wird und der User gespeichert wird.
- `getGameState_doesNotResetAgain_beforeNextInterval` prueft den Gegenfall:
  Nach einem Reset um `10:01:00Z` darf bei `10:01:30Z` noch kein weiterer
  Reset passieren.

Damit ist die Backend-Regel fuer `pokehabit.daily-reset-interval=PT1M`
automatisiert abgesichert, ohne im Test real eine Minute warten zu muessen.

### Browser-E2E

Der Playwright-Test `tests/e2e/daily-reset.spec.ts` simuliert das Reset-Intervall
ueber gemockte API-Antworten:

1. Login mit Spielstand vor Reset: Wasser `2500 ml`, Streak `2`, alle Quests
   offen.
2. User klickt `+500 ml`; Wasser erreicht `3000 / 3000 ml`, Wasser-Buttons sind
   deaktiviert.
3. User erledigt die Lernquest; der Quest-Button zeigt `Erledigt` und ist
   deaktiviert.
4. Der Mock stellt den Serverzustand auf "Reset abgelaufen".
5. Der Auto-Refresh des Dashboards ruft `GET /api/user/game-state` erneut ab.
6. Playwright prueft sichtbar im Browser:
   - `0 / 3000 ml`
   - `+250 ml` und `+500 ml` sind aktiv
   - `30 Minuten lernen` hat wieder den Button `Erledigen`
   - `0/2` Quests sind erledigt
   - Es wurde kein zweiter Login ausgefuehrt.

Ausfuehrung:

```bash
cd frontend
npm run test:e2e -- daily-reset.spec.ts
```

Manueller Kurztest ohne 24 Stunden Wartezeit:

- Automatisiert: den obigen Playwright-Test starten. Er mockt den abgelaufenen
  Reset und prueft den sichtbaren Browserzustand.
- Echte App lokal: Backend nur temporaer mit
  `pokehabit.daily-reset-interval=PT1M` starten, im Dashboard eine Quest/Wasser
  erledigen, mindestens eine Minute warten und den Auto-Refresh abwarten. Das
  Dashboard fragt den Spielstand regelmaessig neu ab; dadurch wird der Reset
  kurz nach Ablauf des Intervalls sichtbar, ohne dass der User neu einloggen
  muss.
- Wichtig: Die eingecheckte Dev-Konfiguration bleibt auf `PT24H`.

## Testfall DR-01: Buttons vor Ablauf bleiben erledigt

**Vorbedingung**

- User ist eingeloggt.
- Wasserstand ist `3000 / 3000 ml`.
- Wasser-Task ist erledigt.
- Mindestens eine normale Quest ist erledigt.
- Reset-Intervall ist noch nicht abgelaufen.

**Schritte**

1. Dashboard neu laden oder Session wiederherstellen.
2. Wasserkarte pruefen.
3. Normale Questkarte pruefen.

**Erwartetes Ergebnis**

- Wasserkarte zeigt `3000 / 3000 ml`.
- Wasser-Buttons `+250 ml` und `+500 ml` sind deaktiviert.
- Normale Quest zeigt `Task erledigt`.
- Quest-Button zeigt `Erledigt` und ist deaktiviert.
- Anmelde-Serie bleibt unveraendert, wenn der Login am selben UTC-Tag erfolgt.

## Testfall DR-02: Buttons nach Reset-Intervall werden ohne neuen Login offen

**Vorbedingung**

- User hat am Vortag oder vor dem temporaer gesetzten Kurztest-Intervall Tasks
  abgeschlossen.
- Backend ist fuer den manuellen Kurztest temporaer z. B. mit
  `pokehabit.daily-reset-interval=PT1M` konfiguriert.
- Seit dem letzten Reset-Anker ist mindestens das konfigurierte Intervall
  vergangen.

**Schritte**

1. User bleibt im Dashboard eingeloggt.
2. Mindestens eine Minute warten.
3. Auto-Refresh des Dashboards abwarten.
4. Wasserkarte pruefen.
5. Normale Questkarte pruefen.

**Erwartetes Ergebnis**

- Wasserstand ist `0 / 3000 ml`.
- Wasser-Buttons `+250 ml` und `+500 ml` sind aktiv.
- Normale Quest zeigt `Offen im Tagesplan`.
- Quest-Button zeigt `Erledigen` und ist aktiv.
- Quest-Fortschritt zeigt wieder `0/n`.

## Testfall DR-03: Anmelde-Serie erhoeht sich am Folgetag

**Vorbedingung**

- User hatte zuletzt gestern nach UTC einen erfolgreichen Login.
- Aktuelle Streak ist `2`.
- Neuer Login erfolgt heute nach UTC.

**Schritte**

1. User meldet sich erfolgreich an.
2. Dashboard oeffnet sich.
3. Metrik `Anmelde-Serie` pruefen.

**Erwartetes Ergebnis**

- Backend liefert `streak=3`.
- Frontend zeigt in der Metrik `Anmelde-Serie` den Wert `3`.

## Testfall DR-04: Reset-Intervall ohne neuen UTC-Tag

**Vorbedingung**

- Kurztest-Reset-Intervall ist temporaer z. B. `PT1M`.
- Letzter Login war vor mindestens einer Minute, aber am selben UTC-Tag.
- Aktuelle Streak ist `2`.

**Schritte**

1. User bleibt im Dashboard eingeloggt.
2. Mindestens eine Minute warten.
3. Dashboard pruefen.

**Erwartetes Ergebnis**

- Wasser und Quest-Buttons sind zurueckgesetzt.
- Anmelde-Serie bleibt `2`, weil kein neuer UTC-Tag erreicht wurde.

## Testfall DR-05: Verpasster Tag setzt Serie zurueck

**Vorbedingung**

- Letzter Login war aelter als gestern nach UTC.
- Aktuelle Streak ist groesser als `1`.

**Schritte**

1. User meldet sich erneut an.
2. Dashboard pruefen.

**Erwartetes Ergebnis**

- Backend liefert `streak=1`.
- Frontend zeigt `Anmelde-Serie` mit `1`.
- Tageswerte sind ebenfalls zurueckgesetzt, wenn das Reset-Intervall erreicht ist.
