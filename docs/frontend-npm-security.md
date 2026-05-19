# Frontend npm Security Check

Stand: 2026-05-19

## Scope

Dieser Check gilt nur für das Frontend unter `frontend/`.
Backend, Infrastruktur, Docker-Images und sonstige Repository-Teile sind nicht Teil dieser Bewertung.

Geprüfte Dateien:

- `frontend/package.json`
- `frontend/package-lock.json`
- `tests/unit/frontend/npm-security.test.ts`

## Aktueller Befund

Das Frontend hat nach der Bereinigung aktuell keine von `npm audit` gemeldeten Vulnerabilities ab `moderate`.

Ausgeführter Live-Check:

```bash
cd frontend
npm run security:audit
```

Ergebnis am 2026-05-19:

```text
found 0 vulnerabilities
```

Vor der Bereinigung meldete `npm audit` im Frontend 10 Funde:

- 2 high
- 8 moderate
- 0 critical

Die Funde lagen im Build- und Test-Tooling, nicht in produktiven Runtime-Abhängigkeiten. Bereinigt wurde durch Updates im Frontend-Dependency-Tree und durch einen gezielten `webpack-dev-server`-Override auf die gepatchte Version `5.2.4`.

## Current npm Supply-Chain Incidents

Die Doku und der Test berücksichtigen die zurzeit relevanten npm-Supply-Chain-Fälle:

- TanStack Router/Start npm compromise vom 2026-05-11. Laut TanStack wurden 84 kompromittierte Versionen in 42 `@tanstack/*` Paketen veröffentlicht; der offizielle Status wurde am 2026-05-15 auf all-clear gesetzt. Quelle: https://tanstack.com/blog/npm-supply-chain-compromise-postmortem
- Axios npm compromise vom 2026-03-31. Microsoft nennt `axios@1.14.1`, `axios@0.30.4` und `plain-crypto-js@4.2.1` als kompromittierte Pakete/Versionen. Quelle: https://www.microsoft.com/en-us/security/blog/2026/04/01/mitigating-the-axios-npm-supply-chain-compromise/

Aktueller Frontend-Status:

- Keine `axios`-Abhängigkeit im Lockfile.
- Keine `plain-crypto-js`-Abhängigkeit im Lockfile.
- Keine `@tanstack/*`-Abhängigkeit mit dem bekannten kompromittierten `@tanstack/setup`-Fingerprint im Lockfile.

## Checks

### Live Audit

```bash
cd frontend
npm run security:audit
```

Der Befehl nutzt:

```bash
npm audit --audit-level=moderate --omit=optional
```

`npm audit` fragt die npm Registry nach bekannten Vulnerabilities für den aktuellen Dependency-Tree. Der Befehl ist absichtlich ein Live-Check und braucht Netzwerkzugriff. Laut npm-Dokumentation gibt `npm audit` einen Fehlercode zurück, wenn Vulnerabilities gefunden werden. Quelle: https://docs.npmjs.com/cli/v11/commands/npm-audit/

### Offline Lockfile Guard

```bash
cd frontend
npm run security:lockfile
```

Der Vitest-Test prüft reproduzierbar und ohne Netzwerk:

- keine bekannten kompromittierten Axios-Versionen
- kein kompromittiertes `plain-crypto-js@4.2.1`
- kein TanStack-Lockfile-Fingerprint aus dem Router/Start-Vorfall
- produktive Frontend-Abhängigkeiten sind exakt gepinnt
- `package.json` und `package-lock.json` sind für produktive Abhängigkeiten synchron

### Combined Frontend Check

```bash
cd frontend
npm run security:frontend
```

Dieser Befehl führt erst den Offline-Lockfile-Test und danach den Live-Audit aus.

## Grenzen

Der Check ersetzt keine vollständige Supply-Chain-Analyse:

- `npm audit` erkennt nur bekannte Advisories in der Registry-Datenbank.
- Der Offline-Test deckt nur dokumentierte Incident-Indikatoren ab.
- Ein frisch kompromittiertes Paket ohne Advisory kann trotz grüner Checks existieren.
- Backend-, Docker- und Infrastruktur-Abhängigkeiten werden hier bewusst nicht bewertet.

Für dieses Projekt ist der Check trotzdem sinnvoll, weil das Frontend einen eigenen npm-Lockfile hat und der Security-Status damit schnell und reproduzierbar geprüft werden kann.
