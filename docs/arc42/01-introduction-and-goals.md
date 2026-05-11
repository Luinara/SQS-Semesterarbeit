# Introduction and Goals

This project, developed as part of a Software Quality Assurance (SQS) course, aims to create a self-care companion web application that integrates gamification elements to encourage healthy habits and task completion.

## Requirements Overview

The application provides a platform for users to manage their self-care tasks. To increase motivation, the system incorporates Pokémon-themed gamification:
* **Task Management:** Users can create, track, and complete self-care tasks.
* **Pokémon Progression:** Completing tasks is linked to Pokémon-related rewards, such as catching new Pokémon or progressing existing ones (details to be implemented).
* **Gamified Dashboard:** A visual representation of the user's progress and their Pokémon collection.

The primary focus of this project is not just functionality, but the application of rigorous software quality assurance practices throughout the development lifecycle.

## Quality Goals

The following quality goals are prioritized for this project:

| Priority | Goal | Description |
| :--- | :--- | :--- |
| 1 | **High Test Coverage** | Aim for at least 80% line coverage across the codebase using JUnit, Mockito, and Vitest. |
| 2 | **Automated Testing** | Implementation of a comprehensive test pyramid including unit, integration (database/API), E2E (user flows), and architecture tests. |
| 3 | **Code Quality & Maintainability** | Continuous monitoring via SonarQube, enforcing coding standards (Checkstyle, ESLint), and passing quality gates. |
| 4 | **Resilience** | Handling external service failures (e.g., PokeAPI) gracefully through timeouts and retries. |

## Stakeholders

| Role | Expectation |
| :--- | :--- |
| **Instructors (SQA Course)** | Expect a well-documented project that demonstrates mastery of quality assurance techniques, including automated testing and CI/CD integration. |
| **Students (Developers)** | Aim to build a functional, maintainable, and well-tested application while learning SQA best practices. |
| **End Users** | Expect a stable, responsive application that helps them manage self-care tasks in a fun and engaging way. |
