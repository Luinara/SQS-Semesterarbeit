# ADR-001: Use Spring Boot for backend

## Status
Accepted

## Context
We need a server-side framework for a Java-based REST API that integrates with a
relational database and an external HTTP service (PokeAPI). The framework should
provide strong defaults for security, testing, and deployment.

## Decision
Use Spring Boot 3 with Spring Web, Spring Data JPA, and Spring Security.

## Consequences
- Convention-over-configuration reduces boilerplate.
- Spring Security simplifies securing the protected endpoint.
- Large ecosystem means easy integration with PostgreSQL, H2 (tests), and WireMock.
