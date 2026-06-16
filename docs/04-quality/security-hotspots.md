# Security Hotspots

## Zweck

Diese Notiz dokumentiert Security-Hotspots, die von SonarCloud oder ähnlichen
statischen Analysewerkzeugen gemeldet wurden. Ein Hotspot bedeutet nicht
automatisch eine Schwachstelle. Er muss im Projektkontext geprüft und entweder
technisch entschaerft oder bewusst als sicher bewertet werden.

## Geprüfte Punkte

| Bereich               | Fund                                        | Bewertung / Massnahme                                                                                                                                                                |
| --------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend-Zufallswerte | `Math.random()` für technische IDs         | Ersetzt durch `crypto.randomUUID()`. Details stehen in `docs/04-quality/crypto-random-ids.md`.                                                                                       |
| Quality Runner HTTP   | Docker-interne URLs mit `http`              | Interne Service-Healthchecks laufen nur im lokalen Docker-Netz. Die URLs sind jetzt konfigurierbar, damit bei TLS-Setups `https` per Environment Override genutzt werden kann.       |
| Quality Runner PATH   | `spawn` mit vererbtem `PATH`                | Der Runner setzt für Kindprozesse einen festen, bekannten `PATH` und startet Bash über `/bin/bash`. `check.env` kann den `PATH` nicht überschreiben.                              |
| Docker Copy           | Rekursives Kopieren in Images               | Das Frontend-Image kopiert gezielt Projektdateien, `src` und `public` statt pauschal das ganze Repository. Damit werden versehentliche sensible Dateien nicht ins Image übernommen. |
| Docker User           | Container laufen standardmaessig als `root` | Runtime-Images wurden auf unprivilegierte User umgestellt, z. B. `USER app`, `nginxinc/nginx-unprivileged` und `USER pwuser`.                                                        |
| Session-Cookie        | `secure` Flag im Dev-Betrieb                | Der Default ist secure. Nur der lokale Docker-Dev-Stack setzt das Flag bewusst auf `false`, weil lokal ohne HTTPS gearbeitet wird.                                                   |

## Quality Runner PATH

SonarCloud meldete, dass bei `spawn(...)` sichergestellt werden soll, dass die
Umgebungsvariable `PATH` nur feste, nicht beschreibbare Verzeichnisse enthaelt.

Die Umsetzung in `quality/runner/quality-runner.mjs` nutzt deshalb:

```js
const commandPath =
  '/opt/java/openjdk/bin:/usr/share/maven/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';
```

Beim Start eines Checks wird die Umgebung kontrolliert erzeugt:

```js
function createCommandEnv(extraEnv = {}) {
  return {
    ...process.env,
    ...extraEnv,
    PATH: commandPath,
  };
}
```

Dadurch können einzelne Checks weiterhin notwendige Variablen setzen, aber den
Suchpfad für ausführbare Dateien nicht manipulieren. Bash wird zudem direkt
über `/bin/bash` gestartet.

## Interne HTTP-URLs

Der Quality Runner verwendet im Docker-Netz Healthchecks auf Frontend und
Backend. Diese Kommunikation ist lokal und nicht für den produktiven Betrieb
gedacht. Damit der Code nicht hart auf Klartext-URLs festgelegt ist, können die
Adressen überschrieben werden:

```powershell
$env:QUALITY_INTERNAL_SCHEME = "https"
$env:QUALITY_FRONTEND_BASE_URL = "https://frontend:3000"
$env:QUALITY_BACKEND_HEALTH_URL = "https://backend:8181/api/tasks"
```

Ohne Overrides nutzt der lokale Docker-Stack weiterhin interne Service-Namen,
weil dort kein TLS-Terminator konfiguriert ist.

## Review-Notiz für SonarCloud

Die Security Hotspots wurden geprüft. Für lokale Entwicklungs- und
Quality-Runner-Szenarien wurden die gemeldeten Risiken entweder technisch
reduziert oder dokumentiert begrenzt:

- keine kryptografische Nutzung von Frontend-IDs
- fester `PATH` für Runner-Kindprozesse
- direkte Bash-Pfadangabe
- konfigurierbare interne URLs
- keine unnoetigen Repository-Kopien in Docker-Images
- unprivilegierte Container-User im Runtime-Betrieb
- secure Cookie als Default, Dev-Ausnahme nur im lokalen Docker-Stack
