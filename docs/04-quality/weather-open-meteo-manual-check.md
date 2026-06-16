# Manueller Open-Meteo-Temperaturcheck

Diese Seite dokumentiert, wie die Temperaturdaten der App ohne UI manuell
geprüft werden können. Der Nachweis nutzt echte `curl.exe`-Aufrufe gegen die
Open-Meteo Forecast API.

Die ausführlichen Code-Notizen zum kompletten App-Flow stehen in
[wetter-daten.md](wetter-daten.md).

## Wichtig

Für die Temperatur ist das Geocoding-JSON nicht der Nachweis. Geocoding liefert
nur Ort und Koordinaten. Die Temperatur kommt aus der Forecast API.

Temperaturfeld:

```text
current.temperature_2m
```

Weitere Forecast-Felder für die Wetter-Szene:

```text
current.weather_code
current.is_day
current.time
```

| JSON-Pfad | Bedeutung in der App |
| --- | --- |
| `current.temperature_2m` | Temperatur in Grad Celsius, wird in der Wetterbeschreibung angezeigt |
| `current.weather_code` | Open-Meteo-Wettercode für klar, wolkig, Regen, Schnee, Gewitter usw. |
| `current.is_day` | `1` für Tag, `0` für Nacht |
| `current.time` | lokale Wetterzeit von Open-Meteo |

## Warum `elevation=nan`?

Die Forecast-URL setzt:

```text
elevation=nan
```

Damit wird keine lokale Höhenkorrektur für einen einzelnen Punkt angewendet.
Das verhindert Ausreisser wie einen kalten Berg-/Inselpunkt bei "Hawaii".

## Manuelles Tool

Zuerst in den Projektordner wechseln:

```powershell
cd C:\Workspace\Uni-26\SQS\SQS-Semesterarbeit
```

Dann im Repo-Root ausführen:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\weather-curl-check.ps1
```

Einzelne Orte prüfen:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\weather-curl-check.ps1 -City "Hawaii", "Tokyo"
```

Forecast-JSON mit Temperatur ausgeben:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\weather-curl-check.ps1 -City "Hawaii" -RawJson
```

Erwartung für die Ausgabe:

- Es erscheint ein `Forecast curl:` mit der Open-Meteo-Forecast-URL.
- Danach erscheint bei `-RawJson` ein Block `Forecast JSON with temperature:`.
- In diesem JSON muss `current.temperature_2m` vorhanden sein.
- Dieser Wert ist die Temperatur, die die App verwendet.

Beispiel für den relevanten Teil:

```json
{
  "current": {
    "time": "2026-06-15T18:15",
    "temperature_2m": 24.7,
    "weather_code": 1,
    "is_day": 1
  }
}
```

In diesem Beispiel erwartet man:

```text
temperature_2m = 24.7
```

Das Tool nutzt Geocoding intern nur, um die Koordinaten wie die App zu finden.
Die Ausgabe konzentriert sich auf den Forecast:

- ausgewählter Ort
- Koordinaten
- Forecast-`curl.exe`-Befehl
- bei `-RawJson`: Forecast-JSON mit `current.temperature_2m`
- Temperatur, Wettercode, Tag/Nacht und lokale API-Zeit

## Forecast-Curl-Snippet

### Eigenen Curl direkt bauen

Wenn eigene Koordinaten bekannt sind, kann der Forecast-Curl direkt gebaut
werden. Nur `latitude` und `longitude` ersetzen:

```powershell
curl.exe -s "https://api.open-meteo.com/v1/forecast?latitude=DEINE_LATITUDE&longitude=DEINE_LONGITUDE&current=temperature_2m,weather_code,is_day&elevation=nan&timezone=auto"
```

Beispiel für Hawaii Kai:

```powershell
curl.exe -s "https://api.open-meteo.com/v1/forecast?latitude=21.29637&longitude=-157.70175&current=temperature_2m,weather_code,is_day&elevation=nan&timezone=auto"
```

### Eigenen Forecast über das Script testen

Das Script kann auch ohne Stadtname direkt mit eigenen Koordinaten laufen:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\weather-curl-check.ps1 -Latitude 21.29637 -Longitude -157.70175 -Label "Mein Ort" -RawJson
```

Erwartet wird wieder ein Forecast-JSON mit:

```text
current.temperature_2m
```

Beispielausgabe der Forecast API:

```json
{
  "current": {
    "time": "2026-06-15T18:15",
    "temperature_2m": 24.7,
    "weather_code": 1,
    "is_day": 1
  }
}
```

Der relevante Temperaturwert ist:

```text
24.7
```

aus:

```text
current.temperature_2m
```

## Automatisierte Tests

Die manuellen Checks werden durch Frontend-Unit-Tests abgesichert:

```powershell
cd frontend
npm.cmd test -- --run ..\tests\unit\frontend\weather.service.test.ts ..\tests\unit\frontend\weather-appearance.logic.test.ts
```

Relevante Tests:

- `weather.service.test.ts`: Stadtauflösung, Hawaii-Migration,
  Weltstadt-Vergleich für Berlin, Los Angeles, Tokyo, Jakarta und Hawaii,
  sowie `elevation=nan` im Forecast-Call.
- `weather-appearance.logic.test.ts`: Mapping von Open-Meteo-Wettercodes auf
  die UI-Szene.

Die Tests mocken Open-Meteo bewusst. Dadurch bleiben sie reproduzierbar und
hängen nicht an Netzwerk, API-Ausfaellen oder wechselndem Echtzeitwetter.
