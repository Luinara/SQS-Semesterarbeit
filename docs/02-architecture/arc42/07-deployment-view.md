# Deployment-Sicht

Dieses Kapitel beschreibt die technische Verteilung der Anwendung. Es zeigt,
auf welchen Containern die Software-Bausteine ausgeführt werden, wie die
Container miteinander kommunizieren und welche externen Systeme angebunden sind.

## Lokales Docker-Deployment

Für die Abgabe ist Docker Compose der zentrale Startweg. Dadurch können
Frontend, Backend, Datenbank und Quality-Umgebung reproduzierbar gestartet
werden, ohne dass die einzelnen Komponenten manuell installiert oder
konfiguriert werden müssen.

Die Anwendung wird lokal als Container-System betrieben. Der Browser greift auf
das Frontend zu. Das Frontend leitet API-Anfragen über den Nginx-Proxy an das
Backend weiter. Das Backend kommuniziert mit der PostgreSQL-Datenbank und nutzt
zusätzlich externe Dienste wie PokeAPI und eine Wetter-API.

| Service          | Image source                | Externer Port               | Interner Port      | Aufgabe                                                                                             |
|------------------|-----------------------------|-----------------------------|--------------------|-----------------------------------------------------------------------------------------------------|
| `db`             | `postgres:16-alpine`        | `${DB_PORT:-5433}`          | `5432`             | Persistente PostgreSQL-Datenbank für die Anwendung.                                                 |
| `backend`        | `backend/Dockerfile`        | `${BACKEND_PORT:-8181}`     | `8181`             | Spring-Boot-API mit Geschäftslogik, Authentifizierung, Persistenzzugriff und externen API-Aufrufen. |
| `frontend`       | `frontend/Dockerfile`       | `${FRONTEND_PORT:-3000}`    | `3000`             | Angular-Frontend, ausgeliefert über Nginx. Leitet `/api`-Anfragen an das Backend weiter.            |

Die Host-Ports sind über Umgebungsvariablen konfigurierbar. Dadurch kann die
Anwendung auch dann gestartet werden, wenn einzelne Standardports lokal bereits
belegt sind.

## Kommunikationsbeziehungen

| Von        | Nach           | Protokoll / Zugriff          | Zweck                                                   |
|------------|----------------|------------------------------|---------------------------------------------------------|
| Browser    | Frontend       | HTTP                         | Nutzung der Weboberfläche.                              |
| Frontend   | Backend        | HTTP über Nginx-Proxy `/api` | Zugriff auf REST-Endpunkte.                             |
| Backend    | PostgreSQL     | JDBC                         | Lesen und Schreiben von Anwendungsdaten.                |
| Backend    | PokeAPI        | HTTP                         | Abruf von Pokémon-Daten.                                |
| Backend    | Weather API    | HTTP                         | Abruf von Wetterdaten für die Darstellung im Dashboard. |


## Start der Anwendung

Normaler App-Start:

```bash
docker compose up --build
```


## Volumes

| Volume    | Use                           |
|-----------|-------------------------------|
| `db_data` | Persistente PostgreSQL-Daten. |


## Konfigurierbarkeit

Die wichtigsten Ports werden über Umgebungsvariablen gesteuert:

| Variable            | Standardwert  | Bedeutung                             |
|---------------------|---------------|---------------------------------------|
| `DB_PORT`           | `5433`        | Host-Port für PostgreSQL.             |
| `BACKEND_PORT`      | `8181`        | Host-Port für die Spring-Boot-API.    |
| `FRONTEND_PORT`     | `3000`        | Host-Port für das Angular-Frontend.   |


Damit bleibt das Deployment lokal flexibel, ohne dass die Docker-Compose-Datei
für unterschiedliche Rechner angepasst werden muss.