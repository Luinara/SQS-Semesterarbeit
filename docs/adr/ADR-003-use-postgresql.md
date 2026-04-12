# ADR-003: Use PostgreSQL as persistence layer

## Status
Accepted

## Context
The application requires persistent storage for user and task data.

## Decision
Use PostgreSQL as the primary database. H2 in-memory is used during automated tests.

## Consequences
- Proven relational database with good Spring Data JPA support.
- Docker Compose makes local setup straightforward.
- H2 allows fast, isolated tests without a running database server.
