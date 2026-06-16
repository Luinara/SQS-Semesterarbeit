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

- User hat am Vortag oder vor dem Demo-Reset-Intervall Tasks abgeschlossen.
- Backend ist fuer Demo/Dev z. B. mit `pokehabit.daily-reset-interval=PT1M`
  konfiguriert.
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

- Demo-Reset-Intervall ist z. B. `PT1M`.
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
