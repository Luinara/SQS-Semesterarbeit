# API-Dokumentation: Authentifizierung

Dieses Dokument beschreibt die aktuell im Backend implementierten Authentication-API-Endpunkte.

## Basispfad

Alle Authentifizierungs-Endpunkte liegen unter:

```txt
/api/auth
```

---

## Authentication Controller

### POST /api/auth/signup

* Zweck: Erstellt einen neuen User-Account und meldet den User automatisch an.
* Request Content-Type: `application/json`
* Request Body (JSON):

  * `username` (string, required)
  * `password` (string, required, minimum length 8)

Beispiel für den Request Body:

```json
{
  "username": "alice",
  "password": "geheim123"
}
```

Responses:

* 201 Created

  * Body: `{ "message": "user created" }`
  * Nebeneffekt: Für den User wird eine Session erstellt; die HTTP-Response enthält ein vom Server verwaltetes Session-Cookie (`JSESSIONID`).

* 400 Bad Request

  * Body: `{ "error": "username and password must be provided" }` oder eine passende Validierungsmeldung.

* 409 Conflict

  * Body: `{ "error": "username already exists" }`

---

### POST /api/auth/login

* Zweck: Authentifiziert den User und startet eine Session.
* Request Content-Type: `application/json`
* Request Body (JSON):

  * `username` (string, required)
  * `password` (string, required)

Beispiel für den Request Body:

```json
{
  "username": "alice",
  "password": "geheim123"
}
```

Responses:

* 200 OK

  * Body: `{ "token": "<opaque-token>" }`
  * Nebeneffekt: Der Server setzt ein Session-Attribut und gibt ein Session-Cookie (`JSESSIONID`) zurück.
  * Der `token` ist eine opaque UUID und wird serverseitig gespeichert.
  * Clients sollen für weitere authentifizierte Requests primär das Session-Cookie verwenden.

* 401 Unauthorized

  * Body: `{ "error": "invalid username or password" }`

---

### POST /api/auth/logout

* Zweck: Meldet den aktuellen User ab und invalidiert die serverseitige Session bzw. den Token.
* Request Content-Type: keiner, da kein Body benötigt wird.

Responses:

* 204 No Content

  * Nebeneffekt: Der Server entfernt das Session-Attribut und invalidiert den Token serverseitig.

---

## Weitere Controller

* Task-Endpunkte sind in `docs/03-api/tasks.md` dokumentiert.
* User-Game-State- und Account-Endpunkte sind in `docs/03-api/user-game-state.md` dokumentiert.
* User-Action-Endpunkte sind in `docs/03-api/user-actions.md` dokumentiert.

---

## Hinweise

* Sessions sind serverseitig.
* Nach erfolgreichem Login oder Signup gibt der Server das Standard-Session-Cookie (`JSESSIONID`) zurück.
* Browser-Clients müssen `withCredentials` aktivieren, damit Cookies bei fetch/XHR-Requests mitgesendet werden.
* Passwörter werden serverseitig mit BCrypt gehasht.
* User und Spielfortschritt werden über das Spring/JPA-Backend in PostgreSQL in Docker persistiert.
* Das Prisma-Schema und die Migrationen dokumentieren die Datenbankstruktur des verwendeten Stacks.
# API Documentation — Authentication

This document describes the Authentication API endpoints currently implemented in the backend.

## Base path

All authentication endpoints are rooted at:

```
/api/auth
```

---

## Authentication Controller

### POST /api/auth/signup

- Purpose: Create a new user account and automatically sign the user in.
- Request Content-Type: `application/json`
- Request Body (JSON):
  - `username` (string, required)
  - `password` (string, required, minimum length 8)

Example request body:

```json
{
  "username": "alice",
  "password": "geheim123"
}
```

Responses:
- 201 Created
  - Body: `{ "message": "user created" }`
  - Side effect: a session is created for the user; the HTTP response will include a session cookie (JSESSIONID) managed by the server.

- 400 Bad Request
  - Body: `{ "error": "username and password must be provided" }` (or validation message)

- 409 Conflict
  - Body: `{ "error": "username already exists" }`

---

### POST /api/auth/login

- Purpose: Authenticate user and start a session.
- Request Content-Type: `application/json`
- Request Body (JSON):
  - `username` (string, required)
  - `password` (string, required)

Example request body:

```json
{
  "username": "alice",
  "password": "geheim123"
}
```

Responses:
- 200 OK
  - Body: `{ "token": "<opaque-token>" }`
  - Side effect: server sets a session attribute and returns a session cookie (JSESSIONID). The `token` is an opaque UUID and stored server-side; clients should prefer relying on the session cookie for subsequent authenticated requests.

- 401 Unauthorized
  - Body: `{ "error": "invalid username or password" }`

---

### POST /api/auth/logout

- Purpose: Log the current user out (invalidate server-side session/token).
- Request Content-Type: none (no body required)

Responses:
- 204 No Content
  - Side effect: server removes the session attribute and invalidates the token server-side.

---

## Other Controllers

- Task endpoints are documented in `docs/03-api/tasks.md`.
- User game-state and account endpoints are documented in `docs/03-api/user-game-state.md`.
- User action endpoints are documented in `docs/03-api/user-actions.md`.



---

Notes
- Sessions are server-side. On successful login/signup the server returns the standard session cookie (JSESSIONID). Keep `withCredentials` enabled in browser clients if they use fetch/XHR to include cookies.
- Passwords are hashed using BCrypt on the server.
- Users and game progress are persisted through the Spring/JPA backend against PostgreSQL in Docker. The Prisma schema and migrations document the database shape used by the stack.

