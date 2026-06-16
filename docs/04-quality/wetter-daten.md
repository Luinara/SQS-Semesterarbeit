# Wetterdaten: Code-Notizen

Diese Notiz erklärt, wie die Wetterdaten in unserer App funktionieren. Wichtig:
Die Nutzer geben in der App nur einen Stadtnamen ein, z.B. `Madrid`. Latitude
und Longitude müssen Nutzer nicht kennen.

## Kurzer Ablauf

1. Nutzer gibt in der App eine Stadt ein, z.B. `Madrid`.
2. `WeatherService.searchCity("Madrid")` nimmt den Text entgegen.
3. `OpenMeteoWeatherAdapter.resolveCity("Madrid")` fragt die Open-Meteo
   Geocoding API ab.
4. Die App wählt aus den Geocoding-Treffern den besten normalen Ort aus.
5. Der gewählte Ort liefert `latitude`, `longitude` und ein lesbares Label,
   z.B. `Madrid, Madrid, Spanien`.
6. `OpenMeteoWeatherAdapter.loadWeather(location)` ruft die Forecast API auf.
7. Die Temperatur kommt aus `current.temperature_2m`.
8. Wettercode und Tag/Nacht werden in eine UI-Wetterszene übersetzt.
9. Die App speichert den gewählten Ort im Browser-`localStorage`.
10. Alle 10 Minuten aktualisiert die App das Wetter für den gespeicherten Ort.

## Beteilige Dateien

| Datei | Aufgabe |
| --- | --- |
| `frontend/src/app/core/services/weather.service.ts` | App-State für Wetter, Stadt-Suche, Speicherung, Refresh und Fehlertexte |
| `frontend/src/app/core/services/weather.adapter.ts` | Open-Meteo API-Aufrufe: Geocoding und Forecast |
| `frontend/src/app/core/state/weather-appearance.logic.ts` | Wandelt API-Daten in App-Snapshot und UI-Szene um |
| `frontend/src/app/shared/models/weather.model.ts` | Typen für Location, Snapshot und Scene |
| `scripts/weather-curl-check.ps1` | Manuelles Prüftool mit echtem Forecast-Curl |
| `tests/unit/frontend/weather.service.test.ts` | Tests für Stadtauflösung, Refresh, Hawaii-Fix und Forecast-Call |
| `tests/unit/frontend/weather-appearance.logic.test.ts` | Tests für Wettercode-Mapping und UI-Szene |

## Stadtname zu Koordinaten

Die App nutzt zuerst die Open-Meteo Geocoding API:

```text
https://geocoding-api.open-meteo.com/v1/search
```

Der Adapter setzt diese Query-Parameter:

```text
name=<Stadtname>
count=10
language=de
format=json
```

Beispiel für `Madrid`:

```text
name=Madrid&count=10&language=de&format=json
```

Das Geocoding-JSON liefert keine Temperatur. Es liefert nur Kandidaten mit
Koordinaten und Metadaten:

```json
{
  "results": [
    {
      "name": "Madrid",
      "admin1": "Madrid",
      "country": "Spanien",
      "latitude": 40.4165,
      "longitude": -3.70256,
      "feature_code": "PPLC",
      "elevation": 665,
      "population": 3255944
    }
  ]
}
```

Relevant sind hier:

```text
results[].name
results[].admin1
results[].country
results[].latitude
results[].longitude
results[].feature_code
results[].elevation
results[].population
```

## Warum gibt es ein Ranking?

Open-Meteo kann mehrere Treffer für denselben Suchtext liefern. Beispiel:
`Tokyo` kann Treffer in Japan, Papua-Neuguinea oder anderen Ländern liefern.
`Hawaii` kann einen Inselpunkt oder bewohnte Orte liefern.

Darum bewertet die App die Treffer:

- bewohnte Orte (`PPL`, `PPLA`, `PPLC`, `PPLX` usw.) werden bevorzugt
- Hauptstädte (`PPLC`) bekommen extra Gewicht
- regionale Hauptorte (`PPLA*`) bekommen extra Gewicht
- passende Namen bekommen Gewicht
- passende Admin-Regionen bekommen Gewicht
- niedrigere Höhe ist besser als ein Berg-/Insel-Höhenpunkt
- größere Population bekommt Gewicht
- frühere API-Treffer bleiben bei Gleichstand leicht vorne

Dadurch wird z.B.:

```text
Tokyo -> Tokio, Tokio, Japan
Hawaii -> Hawaii Kai, Hawaii, Vereinigte Staaten
Madrid -> Madrid, Madrid, Spanien
```

## Koordinaten zu Temperatur

Nach der Ortsauswahl ruft die App die Open-Meteo Forecast API auf:

```text
https://api.open-meteo.com/v1/forecast
```

Die App setzt diese Query-Parameter:

```text
latitude=<Latitude>
longitude=<Longitude>
current=temperature_2m,weather_code,is_day
elevation=nan
timezone=auto
```

Beispiel für Madrid:

```powershell
curl.exe -s "https://api.open-meteo.com/v1/forecast?latitude=40.4165&longitude=-3.70256&current=temperature_2m,weather_code,is_day&elevation=nan&timezone=auto"
```

Das ist der relevante JSON-Teil:

```json
{
  "current": {
    "time": "2026-06-16T06:30",
    "interval": 900,
    "temperature_2m": 19.2,
    "weather_code": 0,
    "is_day": 0
  }
}
```

Die Temperatur der App ist:

```text
current.temperature_2m
```

In diesem Beispiel:

```text
19.2 °C
```

## Warum `elevation=nan`?

Die App setzt im Forecast-Call:

```text
elevation=nan
```

Damit soll Open-Meteo keine lokale Höhenkorrektur für einen einzelnen Punkt
anwenden. Das verhindert Ausreisser wie beim alten Hawaii-Problem, bei dem ein
Insel-/Bergpunkt eine viel zu kalte Temperatur lieferte.

## Was wird in der App gespeichert?

Nach einer erfolgreichen Suche speichert `WeatherService` diese Location im
Browser-`localStorage`:

```json
{
  "latitude": 40.4165,
  "longitude": -3.70256,
  "label": "Madrid, Madrid, Spanien"
}
```

Der Key ist:

```text
sqs-weather-location
```

Beim nächsten App-Start liest die App diese gespeicherte Location wieder aus.
Wenn nichts gespeichert ist, startet die App mit Berlin:

```json
{
  "latitude": 52.52,
  "longitude": 13.41,
  "label": "Berlin"
}
```

## Hawaii-Migration

Es gab vorher einen falschen gespeicherten Hawaii-Punkt:

```text
Hawaii, Hawaii, Vereinigte Staaten
latitude=19.54814
longitude=-155.66495
```

Dieser Punkt lag auf einem hohen Insel-/Bergpunkt und lieferte unplausible
Temperaturen. `WeatherService` migriert diesen alten Wert auf:

```text
Hawaii Kai, Hawaii, Vereinigte Staaten
latitude=21.29637
longitude=-157.70175
```

## Wettercode zu UI-Szene

`weather-appearance.logic.ts` mappt Open-Meteo-Wettercodes:

| Open-Meteo-Code | App-Bedingung |
| --- | --- |
| `0` | `clear` |
| `1`, `2`, `3` | `cloudy` |
| `45`, `48` | `fog` |
| `51` bis `67`, `80` bis `82` | `rain` |
| `71` bis `77` | `snow` |
| `95` | `storm` |
| `96`, `99` | `hail` |

`current.is_day` entscheidet:

```text
1 -> day
0 -> night
```

Daraus entsteht z.B.:

```text
rain-day
clear-night
cloudy-day
```

Diese Klasse steuert dann den Pet-Hintergrund.

## Manuell wie die App prüfen

In PowerShell:

```powershell
cd C:\Workspace\Uni-26\SQS\SQS-Semesterarbeit
```

Freien Stadtnamen testen, z.B. Madrid:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\weather-curl-check.ps1 -City "Madrid" -RawJson
```

Erwartung:

- Das Script wählt eine Location, z.B. `Madrid, Madrid, Spanien`.
- Es zeigt den echten Forecast-Curl.
- Mit `-RawJson` zeigt es das Forecast-JSON.
- Im Forecast-JSON muss `current.temperature_2m` stehen.
- Genau dieser Wert ist die Temperatur, die unsere App nutzt.

Beispielausgabe:

```json
{
  "current": {
    "temperature_2m": 19.2,
    "weather_code": 0,
    "is_day": 0
  }
}
```

## Eigene Koordinaten prüfen

Wenn man bewusst einen bestimmten Punkt prüfen will, kann man eigene
Koordinaten nutzen:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\weather-curl-check.ps1 -Latitude 40.4165 -Longitude -3.70256 -Label "Madrid manuell" -RawJson
```

Das ist nicht der normale App-Flow. Der normale App-Flow ist:

```text
Stadtname -> Geocoding -> Koordinaten -> Forecast -> current.temperature_2m
```

## Tests

Wettertests laufen so:

```powershell
cd C:\Workspace\Uni-26\SQS\SQS-Semesterarbeit\frontend
npm.cmd test -- --run ..\tests\unit\frontend\weather.service.test.ts ..\tests\unit\frontend\weather-appearance.logic.test.ts
```

Die Tests nutzen gemockte API-Antworten. Das ist Absicht: Sie sollen stabil
bleiben und nicht von Echtzeitwetter oder Internetverbindung abhängen.
