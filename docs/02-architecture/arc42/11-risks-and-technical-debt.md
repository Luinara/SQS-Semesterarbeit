# Risiken und technische Schulden

| Risiko / Schuld | Auswirkung | Umgang damit |
| --- | --- | --- |
| Tageshistorie ist noch vereinfacht. | Historische Auswertung pro Tag ist begrenzt und eingeschränkt. | Als Erweiterung dokumentiert; der aktuelle Stand nutzt Serverantworten und Tagesanzeige im Frontend. |
| Cookie-Hardening hängt vom Deployment ab. | Produktivbetrieb braucht Secure-Flags und CSRF-Policy. | Dev-Profil ist dokumentiert; Produktivhärtung ist separater Deployment-Schritt. |
| Externe APIs können ausfallen. | Wetter oder Pokémon-Bilder laden eventuell nicht. | Frontend-Fallbacks halten das Dashboard benutzbar; das Backend kapselt Open-Meteo und PokeAPI mit kurzen Timeouts und lokalen Standarddaten. |
| `npm audit` und Docker-Pulls brauchen Netzwerk. | Vollständig offline ist nur mit Cache möglich. | Offline-Lockfile-Test ergänzt den Live-Audit. |
