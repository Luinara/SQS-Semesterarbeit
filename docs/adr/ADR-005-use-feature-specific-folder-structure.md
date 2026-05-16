# ADR-005: Use Feature-Specific Folder Structure over Layer-Specific Structure

## Status
Accepted

## Context
The backend codebase needs clear organization as the project grows. Two main architectural patterns exist:
- **Layer-Specific Structure**: Organize by technical layers (controllers/, services/, repositories/)
- **Feature-Specific Structure**: Organize by business features (user/, task/, authentication/)

Both patterns have tradeoffs regarding maintainability, testability, and scalability.

## Decision
Use feature-specific folder structure, where each business domain (user, task, authentication, weather) 
contains its own controller, service, repository, DTOs, mappers, and exceptions.

## Reasoning

- Cleaner Responsibilities:
  - Each feature is self-contained and owns all its layers
  - Developers working on a feature know exactly where to find related code
  - Reduces cognitive load: all user-related logic is in the `user/` folder

- Simpler Naming:
  - lasses are all named just `Service`, `Repository`, etc. and are identified by their package
  - 

- Better Testing - Feature-specific structure enables better test organization:
  - **Unit tests mirror structure**: `user/ServiceTest.java` sits next to `user/Service.java`
  - **Integration tests are scoped**: `user/UserControllerIntegrationTest.java` tests the entire user feature
  - **Easier test setup**: All mocks and fixtures for a feature are co-located
  - **Better test isolation**: Tests for user feature don't interfere with task feature tests
  - Compared to layer-specific: retrieving `repositories/UserRepository.java` test requires navigating `test/repositories/UserRepositoryTest.java`

- Feature Independence
  - Clear boundaries between features reduce coupling
  - Team can work on features in parallel without merge conflicts

## Consequences

### Advantages
- High cohesion: related code is grouped together
- Low coupling: features don't depend on each other's internals
- Faster development: all feature code is in one place
- Easier onboarding: new developers quickly understand feature boundaries
- Better refactoring: moving/deleting a feature is straightforward
- Improved scalability: adding new features doesn't require modifying existing layers
- Improved Feature Tests: All feature related code is in the same (test) package

### Downsides
- More folders: creates more directories than layer-specific structure
- Potential code duplication: shared utilities may be replicated across features
  - **Mitigation**: Extract shared logic into `common/` or `shared/` package
- Less obvious for layer-specific developers: teams familiar with traditional layer structure need adjustment
- Harder to apply cross-cutting concerns: finding all services/repositories requires feature traversal
  - **Mitigation**: Use Spring profiles or annotation-based configuration

## Related Decisions
- [ADR-001: Use Spring Boot](./ADR-001-use-spring-boot.md) (provides dependency injection framework for this structure)
- [ADR-003: Use PostgreSQL](./ADR-003-use-postgresql.md) (repository layer design influences feature structure)

