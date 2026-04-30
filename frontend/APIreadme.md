# Frontend API Dokumentation fuer Dummies

Diese Datei erklaert die aktuelle "API" des Frontends. Wichtig: Im Moment spricht das Frontend noch nicht mit einem echten Backend per HTTP. Die App nutzt eine lokale Demo-API ueber Angular-Services, Mock-Daten und `localStorage`.

Kurz gesagt:

- Es gibt keine echten REST-Endpunkte wie `GET /api/tasks`.
- Die Komponenten rufen Methoden im `AppStateService` auf.
- Der `AppStateService` verwaltet Login, Registrierung, Tasks, Pet-Fortschritt und Speicherung.
- Gespeichert wird lokal im Browser unter dem Key `sqs.frontend.mvp.state`.

## Wo liegt die Frontend-API?

| Datei | Aufgabe |
| --- | --- |
| `src/app/core/services/app-state.service.ts` | Zentrale Service-API fuer Komponenten |
| `src/app/core/services/browser-storage.service.ts` | Lesen und Schreiben in `localStorage` |
| `src/app/core/state/app-state.logic.ts` | Reine Fachlogik fuer Login, Tasks, Pet und Reset |
| `src/app/shared/mock/mock-data.ts` | Demo-Daten und Pet-Regeln |
| `src/app/shared/models/*.ts` | TypeScript-Datentypen |

## Grundidee

Komponenten sollen nicht direkt mit `localStorage` arbeiten und auch nicht selbst Spiellogik berechnen. Stattdessen nutzen sie den `AppStateService`.

Einfaches Bild:

```text
Angular Component
    |
    v
AppStateService
    |
    v
app-state.logic.ts + mock-data.ts
    |
    v
BrowserStorageService
    |
    v
localStorage im Browser
```

## AppStateService

Der `AppStateService` ist die wichtigste API fuer das Frontend.

Import:

```ts
import { AppStateService } from './core/services/app-state.service';
```

In einer Angular-Komponente wird der Service normalerweise per Dependency Injection genutzt:

```ts
constructor(private readonly appState: AppStateService) {}
```

Oder mit `inject`:

```ts
const appState = inject(AppStateService);
```

## So benutzt man die Frontend-API Schritt fuer Schritt

Dieser Abschnitt zeigt den typischen Weg, wie eine Angular-Komponente die Frontend-API benutzt.

### 1. Service importieren

In der Komponente wird zuerst der `AppStateService` importiert:

```ts
import { AppStateService } from '../../core/services/app-state.service';
```

Der genaue Pfad haengt davon ab, wo die Komponente liegt.

### 2. Service in der Komponente verfuegbar machen

Variante A: mit `inject`

```ts
import { Component, inject } from '@angular/core';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'sqs-example',
  standalone: true,
  templateUrl: './example.component.html',
})
export class ExampleComponent {
  readonly appState = inject(AppStateService);
}
```

Variante B: ueber den Constructor

```ts
import { Component } from '@angular/core';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'sqs-example',
  standalone: true,
  templateUrl: './example.component.html',
})
export class ExampleComponent {
  constructor(readonly appState: AppStateService) {}
}
```

Im Projekt ist beides moeglich. Wichtig ist nur: Komponenten sollen den `AppStateService` benutzen und nicht direkt `localStorage` oder Mock-Daten manipulieren.

### 3. Daten im Template anzeigen

Da viele Werte Signals sind, werden sie im Template mit Klammern gelesen:

```html
@if (appState.user(); as user) {
  <p>Hallo {{ user.userName }}</p>
}

@if (appState.pet(); as pet) {
  <p>Level: {{ pet.level }}</p>
  <p>Futterpunkte: {{ pet.availableFoodPoints }}</p>
}
```

Tasks anzeigen:

```html
@for (task of appState.tasks(); track task.id) {
  <article>
    <h3>{{ task.title }}</h3>
    <p>{{ task.description }}</p>
    <button type="button" (click)="completeTask(task.id)">
      Erledigen
    </button>
  </article>
}
```

Passende Methode in der Komponente:

```ts
completeTask(taskId: string): void {
  this.appState.completeTask(taskId);
}
```

### 4. Login aus einem Formular ausloesen

Beispiel fuer eine einfache Login-Methode:

```ts
login(): void {
  const result = this.appState.login({
    email: this.email,
    password: this.password,
  });

  this.message = result.message;

  if (result.success) {
    // Danach kann die Komponente z. B. zum Dashboard navigieren.
  }
}
```

Wichtig:

- `login` gibt ein `AuthResult` zurueck.
- `success: true` bedeutet: Login war erfolgreich.
- `success: false` bedeutet: Login war nicht erfolgreich.
- Die Fehlermeldung steht in `message`.

### 5. Registrierung ausloesen

```ts
register(): void {
  const result = this.appState.register({
    email: this.email,
    password: this.password,
    userName: this.userName,
  });

  this.message = result.message;
}
```

Nach erfolgreicher Registrierung ist das neue Konto direkt aktiv. Die Komponente muss also kein zweites Login ausfuehren.

### 6. Logout ausloesen

```ts
logout(): void {
  this.appState.logout();
}
```

Danach ist `appState.isAuthenticated()` wieder `false`.

### 7. Pet fuettern

```ts
feedPet(): void {
  this.appState.feedPet();
}
```

Die Methode prueft selbst, ob genug Futterpunkte vorhanden sind. Die Komponente muss diese Regel nicht nachbauen.

### 8. Fortschritt zuruecksetzen

```ts
resetProgress(): void {
  this.appState.resetCurrentProgress();
}
```

Das setzt Tasks, Punkte und Pet-Fortschritt zurueck, aber nicht das Konto.

## Vollstaendiges Mini-Beispiel

Dieses Beispiel zeigt eine kleine Komponente, die mehrere API-Funktionen benutzt.

```ts
import { Component, inject } from '@angular/core';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'sqs-mini-dashboard',
  standalone: true,
  template: `
    @if (appState.user(); as user) {
      <h2>Hallo {{ user.userName }}</h2>
    }

    @if (appState.pet(); as pet) {
      <p>{{ pet.name }} ist Level {{ pet.level }}</p>
      <p>Futterpunkte: {{ pet.availableFoodPoints }}</p>
    }

    <button type="button" (click)="feedPet()">Pet fuettern</button>
    <button type="button" (click)="logout()">Logout</button>
  `,
})
export class MiniDashboardComponent {
  readonly appState = inject(AppStateService);

  feedPet(): void {
    this.appState.feedPet();
  }

  logout(): void {
    this.appState.logout();
  }
}
```

## Lesende API

Diese Werte sind Angular Signals bzw. Computed Signals. Man liest sie mit Klammern aus, zum Beispiel `appState.user()`.

| Wert | Typ | Bedeutung |
| --- | --- | --- |
| `activeAccount()` | `MockAccount | null` | Aktuell angemeldetes lokales Konto oder `null` |
| `isAuthenticated()` | `boolean` | Sagt, ob ein Nutzer angemeldet ist |
| `user()` | `AppUser | null` | Aktueller Nutzer |
| `pet()` | `PetState | null` | Aktueller Pet-Zustand |
| `tasks()` | `TaskItem[]` | Aufgabenliste des aktiven Nutzers |
| `totalTaskCount()` | `number` | Anzahl aller Aufgaben |
| `completedTaskCount()` | `number` | Anzahl erledigter Aufgaben |
| `feedCost` | `number` | Kosten fuer eine Pet-Fuetterung |

Beispiel:

```ts
const user = this.appState.user();

if (user) {
  console.log(user.userName);
}
```

Beispiel fuer Tasks:

```ts
const tasks = this.appState.tasks();
const openTasks = tasks.filter((task) => !task.isCompleted);
```

## Schreibende API

Diese Methoden veraendern den Zustand der App.

| Methode | Parameter | Rueckgabe | Bedeutung |
| --- | --- | --- | --- |
| `login(credentials)` | `LoginCredentials` | `AuthResult` | Meldet einen lokalen Demo-Nutzer an |
| `register(credentials)` | `RegisterCredentials` | `AuthResult` | Erstellt ein lokales Konto und meldet es direkt an |
| `logout()` | keine | `void` | Meldet den aktuellen Nutzer ab |
| `completeTask(taskId)` | `string` | `void` | Markiert eine Aufgabe als erledigt und gibt Punkte |
| `feedPet()` | keine | `void` | Fuettert das Pet, falls genug Punkte vorhanden sind |
| `resetCurrentProgress()` | keine | `void` | Setzt den Spielfortschritt des aktiven Kontos zurueck |

## Login

Typ:

```ts
interface LoginCredentials {
  email: string;
  password: string;
}
```

Beispiel:

```ts
const result = this.appState.login({
  email: 'demo@sqs.app',
  password: 'cozyfocus',
});

if (result.success) {
  console.log(result.message);
}
```

Moegliche Rueckgabe:

```ts
interface AuthResult {
  success: boolean;
  message: string;
}
```

Wenn die Login-Daten falsch sind, bleibt der Nutzer abgemeldet und `success` ist `false`.

## Registrierung

Typ:

```ts
interface RegisterCredentials {
  email: string;
  password: string;
  userName: string;
}
```

Beispiel:

```ts
const result = this.appState.register({
  email: 'mira@example.com',
  password: 'geheim123',
  userName: 'Mira',
});
```

Regeln:

- E-Mail-Adressen werden getrimmt und kleingeschrieben.
- Doppelte E-Mail-Adressen sind nicht erlaubt.
- Nach erfolgreicher Registrierung ist das neue Konto direkt aktiv.
- Neue Konten starten mit denselben Demo-Aufgaben und einem frischen Pet.

## Logout

Beispiel:

```ts
this.appState.logout();
```

Was passiert:

- `activeUserId` wird auf `null` gesetzt.
- Die lokalen Konten bleiben erhalten.
- Der Nutzer kann sich spaeter wieder anmelden.

## Aufgabe abschliessen

Beispiel:

```ts
this.appState.completeTask(task.id);
```

Was passiert:

- Die Aufgabe wird auf `isCompleted: true` gesetzt.
- `totalCompletedTasks` steigt um 1.
- `totalEarnedPoints` steigt um die Punkte der Aufgabe.
- Das Pet bekommt verfuegbare Futterpunkte.
- Happiness und Hearts steigen bis zu ihrem Maximum.

Wichtig:

Wenn eine Aufgabe schon erledigt ist, passiert beim zweiten Klick nichts.

## Pet fuettern

Beispiel:

```ts
this.appState.feedPet();
```

Regeln aus `PET_RULES`:

| Regel | Wert | Bedeutung |
| --- | --- | --- |
| `feedCost` | `12` | So viele Punkte kostet eine Fuetterung |
| `growthPerFeeding` | `34` | So viel Wachstumsfortschritt bringt eine Fuetterung |
| `maxHappiness` | `100` | Maximale Happiness |
| `maxHearts` | `5` | Maximale Herzen |
| `initialGrowthGoal` | `100` | Erstes Wachstumsziel |

Was passiert:

- Wenn zu wenig Futterpunkte da sind, passiert nichts.
- Wenn genug Punkte da sind, werden `12` Punkte abgezogen.
- Das Pet bekommt Wachstumsfortschritt.
- Wenn das Wachstumsziel erreicht wird, steigt das Level.
- Ueberschuessiger Fortschritt bleibt erhalten.

## Fortschritt zuruecksetzen

Beispiel:

```ts
this.appState.resetCurrentProgress();
```

Was passiert:

- Aufgaben werden wieder offen.
- Das Pet wird auf den Demo-Startzustand gesetzt.
- Das Konto bleibt bestehen.
- Der Nutzer bleibt angemeldet.

## Speicherung im Browser

Der aktuelle Zustand wird automatisch im `localStorage` gespeichert.

Storage-Key:

```text
sqs.frontend.mvp.state
```

Der gespeicherte Zustand hat grob diese Form:

```ts
interface StorageSnapshot {
  accounts: MockAccount[];
  activeUserId: string | null;
}
```

Das bedeutet:

- `accounts` enthaelt alle lokal registrierten Demo-Konten.
- `activeUserId` merkt sich, welches Konto gerade angemeldet ist.

Wenn keine gueltigen Daten im Browser liegen, erstellt die App automatisch den Demo-Startzustand.

## Datenmodelle

### AppUser

```ts
interface AppUser {
  id: string;
  email: string;
  userName: string;
  joinedAt: string;
}
```

### TaskItem

```ts
interface TaskItem {
  id: string;
  title: string;
  description: string;
  icon: 'drop' | 'study' | 'pulse' | 'spark' | 'book';
  tone: 'rose' | 'peach' | 'taupe' | 'sage';
  points: number;
  isCompleted: boolean;
}
```

### PetState

```ts
interface PetState {
  name: string;
  level: number;
  growthProgress: number;
  growthGoal: number;
  availableFoodPoints: number;
  happiness: number;
  hearts: number;
  mealsServed: number;
}
```

### GameState

```ts
interface GameState {
  pet: PetState;
  tasks: TaskItem[];
  totalCompletedTasks: number;
  totalEarnedPoints: number;
}
```

### MockAccount

```ts
interface MockAccount {
  user: AppUser;
  password: string;
  gameState: GameState;
}
```

Hinweis: Das Passwort wird aktuell nur lokal fuer die Demo gespeichert. Fuer ein echtes Backend duerfte das Frontend niemals Passwoerter dauerhaft speichern.

## Routen und Zugriff

| Route | Komponente | Schutz |
| --- | --- | --- |
| `/splash` | Splash-Seite | frei |
| `/auth` | Login/Register | nur fuer Gaeste |
| `/dashboard` | Dashboard | nur fuer angemeldete Nutzer |
| `/**` | Weiterleitung | zur Splash-Seite |

Guards:

- `guestGuard`: Angemeldete Nutzer werden vom Auth-Screen zum Dashboard geschickt.
- `authGuard`: Nicht angemeldete Nutzer werden vom Dashboard zum Auth-Screen geschickt.

## Aktueller Demo-Account

```text
E-Mail: demo@sqs.app
Passwort: cozyfocus
```

## Was waere spaeter eine echte Backend-API?

Aktuell ist alles lokal. Spaeter koennte man die Methoden im `AppStateService` durch HTTP-Calls ersetzen oder einen neuen API-Service daneben bauen.

Moegliche spaetere REST-Endpunkte waeren zum Beispiel:

| Frontend-Aktion | Moeglicher Backend-Endpunkt |
| --- | --- |
| Login | `POST /api/auth/login` |
| Registrierung | `POST /api/auth/register` |
| Aktuellen Nutzer laden | `GET /api/me` |
| Tasks laden | `GET /api/tasks` |
| Task abschliessen | `POST /api/tasks/{id}/complete` |
| Pet laden | `GET /api/pet` |
| Pet fuettern | `POST /api/pet/feed` |
| Fortschritt zuruecksetzen | `POST /api/progress/reset` |

Diese Endpunkte existieren aktuell noch nicht im Frontend. Sie sind nur eine Orientierung fuer die spaetere Anbindung.

## Merksatz

Fuer Komponenten gilt:

```text
Nicht direkt localStorage anfassen.
Nicht selbst Account-, Task- oder Pet-Regeln nachbauen.
Immer AppStateService verwenden.
```
