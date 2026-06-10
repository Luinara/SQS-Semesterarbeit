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

- Task Controller


- User Controller


- AuthenticationController (this file)



---

Notes
- Sessions are server-side. On successful login/signup the server returns the standard session cookie (JSESSIONID). Keep `withCredentials` enabled in browser clients if they use fetch/XHR to include cookies.
- Passwords are hashed using BCrypt on the server.
- Current implementation uses an in-memory user store for development; it will be replaced by a persistent store (Postgres + Prisma) in a later branch. The API contract will remain compatible.

