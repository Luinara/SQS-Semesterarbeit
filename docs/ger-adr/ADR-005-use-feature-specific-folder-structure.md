# ADR-005: Feature-spezifische Ordnerstruktur statt schichtenspezifischer Struktur verwenden

## Status
Akzeptiert

## Kontext
Die Backend-Codebasis braucht klare Organisation, während das Projekt wächst. Zwei wichtige Architektur-Muster existieren:
- **Schichtenspezifische Struktur**: Organisation nach technischen Schichten (controllers/, services/, repositories/)
- **Feature-spezifische Struktur**: Organisation nach fachlichen Features (user/, task/, authentication/)

Beide Muster haben Tradeoffs bezüglich Wartbarkeit, Testbarkeit und Skalierbarkeit.

## Entscheidung
Feature-spezifische Ordnerstruktur verwenden, bei der jede Fachdomäne (user, task, authentication, weather)
ihren eigenen Controller, Service, ihr eigenes Repository, DTOs, Mapper und Exceptions enthält.

## Begründung

- Klarere Verantwortlichkeiten:
  - Jedes Feature ist in sich geschlossen und besitzt alle seine Schichten
  - Entwickler, die an einem Feature arbeiten, wissen genau, wo sie zugehörigen Code finden
  - Reduziert kognitive Last: alle user-bezogene Logik ist im `user/`-Ordner

- Einfachere Benennung:
  - Klassen heißen alle einfach nur `Service`, `Repository` usw. und werden über ihr Package identifiziert
  -

- Besseres Testing - Feature-spezifische Struktur ermöglicht bessere Testorganisation:
  - **Unit-Tests spiegeln Struktur wider**: `user/ServiceTest.java` liegt neben `user/Service.java`
  - **Integrationstests sind gescoped**: `user/UserControllerIntegrationTest.java` testet das gesamte User-Feature
  - **Einfacheres Test-Setup**: Alle Mocks und Fixtures für ein Feature liegen zusammen
  - **Bessere Testisolation**: Tests für das User-Feature stören Tests für das Task-Feature nicht
  - Im Vergleich zu schichtenspezifisch: Das Abrufen des Tests für `repositories/UserRepository.java` erfordert Navigation zu `test/repositories/UserRepositoryTest.java`

- Feature-Unabhängigkeit
  - Klare Grenzen zwischen Features reduzieren Kopplung
  - Team kann parallel an Features arbeiten, ohne Merge-Konflikte

## Konsequenzen

### Vorteile
- Hohe Kohäsion: zugehöriger Code ist gruppiert
- Niedrige Kopplung: Features hängen nicht von den Interna anderer Features ab
- Schnellere Entwicklung: aller Feature-Code ist an einem Ort
- Einfacheres Onboarding: neue Entwickler verstehen Feature-Grenzen schnell
- Besseres Refactoring: ein Feature zu verschieben/löschen ist unkompliziert
- Verbesserte Skalierbarkeit: neue Features hinzuzufügen erfordert keine Änderung bestehender Schichten
- Verbesserte Feature-Tests: Aller featurebezogene Code ist im selben (Test-)Package

### Nachteile
- Mehr Ordner: erzeugt mehr Verzeichnisse als schichtenspezifische Struktur
- Potenzielle Code-Duplizierung: geteilte Utilities können über Features hinweg repliziert werden
  - **Mitigation**: Geteilte Logik in ein `common/`- oder `shared/`-Package extrahieren
- Weniger offensichtlich für schichtenspezifische Entwickler: Teams, die mit traditioneller Schichtenstruktur vertraut sind, brauchen Anpassung
- Schwieriger, Cross-Cutting Concerns anzuwenden: Alle Services/Repositories zu finden erfordert Feature-Traversierung
  - **Mitigation**: Spring Profiles oder annotationsbasierte Konfiguration verwenden

## Verwandte Entscheidungen
- [ADR-001: Spring Boot verwenden](./ADR-001-use-spring-boot.md) (stellt Dependency-Injection-Framework für diese Struktur bereit)
- [ADR-003: PostgreSQL verwenden](./ADR-003-use-postgresql.md) (Repository-Schicht-Design beeinflusst Feature-Struktur)
