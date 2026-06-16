# Crypto Random IDs

## Zweck

Im Frontend werden an einigen Stellen kurzlebige IDs erzeugt, zum Beispiel für
UI-Feedback-Meldungen oder lokale Demo-Daten. Diese IDs sind keine Passwoerter,
Tokens, Session-IDs oder fachlichen Berechtigungen. Sie dienen nur dazu, einzelne
UI-Ereignisse eindeutig zu kennzeichnen.

Trotzdem meldet SonarCloud die Nutzung von `Math.random()` als Security Hotspot,
weil ein Pseudozufallszahlengenerator für sicherheitsrelevante Werte ungeeignet
wäre. Um den Hotspot technisch zu vermeiden und eine robuste Standardregel zu
haben, nutzt die App für zufällige ID-Anteile `crypto.randomUUID()`.

## Umsetzung

Betroffene Stellen:

- `frontend/src/app/core/services/app-state.service.ts`
- `frontend/src/app/core/state/app-state.logic.ts`
- `frontend/src/app/shared/mock/mock-data.ts`

Die ID-Erzeugung nutzt bevorzugt:

```ts
globalThis.crypto?.randomUUID?.()
```

Falls die API in einer Test- oder Altumgebung nicht verfuegbar ist, gibt es einen
Fallback auf `Date.now()`. Dieser Fallback ist akzeptabel, weil die Werte nicht
als Geheimnis, Authentifizierungsmerkmal oder Zugriffsschutz verwendet werden.

## Sicherheitsbewertung

- Keine ID aus diesem Mechanismus wird als Session-Cookie, Login-Token,
  Passwort-Reset-Token oder API-Key verwendet.
- Die IDs verlassen den Browser nicht als sicherheitskritischer Nachweis.
- Kollisionen wären für die Anwendung nicht kritisch; im schlimmsten Fall
  betrifft es die Anzeige einer kurzlebigen Feedback-Meldung.
- `crypto.randomUUID()` ist dennoch die bevorzugte Implementierung, weil sie
  kryptografisch starke Zufallswerte nutzt und Sonar-Regel `typescript:S2245`
  nicht triggert.

## Review-Notiz für SonarCloud

Der Security Hotspot wurde geprüft. Die ursprüngliche Verwendung von
`Math.random()` war nicht für Kryptografie gedacht, wurde aber durch
`crypto.randomUUID()` ersetzt. Die verbleibenden IDs sind rein technische
Frontend-IDs ohne Sicherheitsfunktion.

