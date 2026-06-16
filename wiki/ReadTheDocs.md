# ReadTheDocs

Die ausführliche Dokumentation bleibt unter `docs/` und wird mit MkDocs für
ReadTheDocs gebaut.

## Wichtige Dateien

- `.readthedocs.yaml`
- `mkdocs.yml`
- `docs/requirements.txt`
- `docs/index.md`

## Lokaler Build

Falls MkDocs installiert ist:

```bash
mkdocs build
```

## Veröffentlichung

Die konkreten Schritte stehen in:

```text
docs/06-operations/readthedocs-publish.md
```

Nach dem Verbinden des öffentlichen Repositorys mit ReadTheDocs sollte die
veröffentlichte Doku-URL in README, Präsentation und Wiki ergänzt werden.
