# ReadTheDocs veröffentlichen

Die technische Vorbereitung liegt im Repository. Der letzte Schritt passiert im
ReadTheDocs-Webinterface, weil dort das öffentliche Git-Repository verbunden
werden muss.

## Vor dem Verbinden

- Repository ist öffentlich erreichbar.
- `.readthedocs.yaml` liegt im Root.
- `mkdocs.yml` liegt im Root.
- `docs/requirements.txt` enthält `mkdocs`.
- Die Startseite ist `docs/index.md`.

## Schritte in ReadTheDocs

1. Bei ReadTheDocs anmelden.
2. Neues Projekt importieren.
3. Öffentliches Repository auswählen.
4. Standard-Branch bestätigen.
5. Build starten.
6. Nach erfolgreichem Build die öffentliche Doku-URL kopieren.
7. URL in `README.md`, `docs/index.md` und Präsentationsnotizen eintragen.

## Erwarteter Build

ReadTheDocs nutzt:

```yaml
mkdocs:
  configuration: mkdocs.yml
```

Der Build sollte dieselbe Navigation zeigen wie lokal in `mkdocs.yml`.
Wenn der Build fehlschlägt, zuerst prüfen:

- Ist das Repository wirklich öffentlich?
- Wird der richtige Branch gebaut?
- Kann ReadTheDocs `docs/requirements.txt` installieren?
- Stimmen die Pfade in `mkdocs.yml` noch?
