# Laufzeitsicht

## Login und Session

1. Der Nutzer öffnet die App und geht vom Splash-Screen zur Auth-Seite.
2. Das Frontend sendet Login oder Registrierung an `/api/auth/login` bzw. `/api/auth/signup`.
3. Das Backend prüft die Daten, aktualisiert Login-/Streak-Informationen und setzt die Session.
4. Das Frontend lädt Tasks und Spielstand und zeigt danach das Dashboard.

## Quest abschließen

1. Der Nutzer klickt im Dashboard auf `Erledigen`.
2. Die Komponente ruft `AppStateService` auf; der Service nutzt `BackendApiService`.
3. Das Backend prüft die Session und markiert die Task für diesen Nutzer als erledigt.
4. Punkte, Wachstum und Trainingspunkte werden im Backend aktualisiert.
5. Das Frontend lädt den Spielstand neu und zeigt Feedback an.

## Wasser und Training

1. Wasser-Buttons senden die gewählte Menge an `/api/user/water`.
2. Ab dem Grenzwert kann das Backend die Wasser-Quest automatisch abschließen.
3. Training läuft über `/api/user/feed` und verbraucht Trainingspunkte.
4. Das Frontend bekommt den aktualisierten Spielstand zurück.

## Quality-Hub-Lauf

1. `docker compose --profile quality up --build` startet App, DB, Hub und Runner.
2. Der Runner kopiert das Repo in eine Arbeitskopie im Container.
3. Backend-Checks, Frontend-Checks, Security-Check und Playwright laufen nacheinander.
4. Der Runner schreibt `report.json`, Logs und HTML-Reports in `quality_output`.
5. Der Hub liest diese Dateien und aktualisiert die Anzeige automatisch.
