# ReadTheDocs

Die ausfuehrliche Dokumentation bleibt unter `docs/` und wird mit MkDocs fuer
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

## Veroeffentlichung

Die konkreten Schritte stehen in:

```text
docs/06-operations/readthedocs-publish.md
```

Nach dem Verbinden des oeffentlichen Repositorys mit ReadTheDocs sollte die
veroeffentlichte Doku-URL in README, Praesentation und Wiki ergaenzt werden.
