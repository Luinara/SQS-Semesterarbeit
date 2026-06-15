# Risks and Technical Debt

| Risiko / Schuld | Auswirkung | Umgang damit |
| --- | --- | --- |
| Tageshistorie ist noch vereinfacht. | Historische Auswertung pro Tag ist begrenzt. | Als Erweiterung dokumentiert; der aktuelle Stand nutzt Serverantworten und Tagesanzeige im Frontend. |
| Cookie-Hardening hängt vom Deployment ab. | Produktivbetrieb braucht Secure-Flags und CSRF-Policy. | Dev-Profil ist dokumentiert; Produktivhärtung ist separater Deployment-Schritt. |
| Externe APIs können ausfallen. | Wetter oder Pokemon-Bilder laden eventuell nicht. | Frontend-Fallbacks halten das Dashboard benutzbar; das Backend nutzt für PokeAPI kurze Timeouts und lokale Starter-Daten. |
| `npm audit` und Docker-Pulls brauchen Netzwerk. | Vollständig offline ist nur mit Cache möglich. | Offline-Lockfile-Test ergänzt den Live-Audit. |
| Legacy-Doku bleibt archiviert. | Im Archiv stehen bewusst alte React/Vite-Roadmaptexte. | Die Datei ist als Legacy markiert; aktuelle Doku verweist auf Angular und Quality Hub. |
