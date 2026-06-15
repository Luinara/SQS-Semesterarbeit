# Introduction and Goals

This project, developed as part of a Software Quality Assurance (SQS) course, aims to create a self-care companion web application that integrates gamification elements to encourage healthy habits and task completion.

## Requirements Overview

The application provides a platform for users to complete self-care tasks. To increase motivation, the system incorporates Pokémon-themed gamification:
* **Task Management:** Users can view, track, and complete daily self-care tasks.
* **Pokémon Progression:** Completing tasks, drinking water, and training convert into growth, motivation, feed points, and starter evolution progress.
* **Gamified Dashboard:** A visual representation of the user's progress, partner Pokémon, weather scene, daily target, and available actions.

Neben der eigentlichen App soll das Projekt zeigen, dass wir die wichtigsten SQS-Themen praktisch anwenden: Tests, statische Analyse, Security-Checks, Dokumentation und reproduzierbarer Start.

## Quality Goals

The following quality goals are prioritized for this project:

| Priority | Goal | Description |
| :--- | :--- | :--- |
| 1 | **High Test Coverage** | Aim for at least 80% line coverage across the codebase using JUnit, Mockito, and Vitest. |
| 2 | **Automated Testing** | Unit-, Integrations-, E2E- und Architekturtests prüfen die wichtigsten Schichten des Projekts. |
| 3 | **Code Quality & Maintainability** | Enforced by the dockerized Quality Hub, Checkstyle, SpotBugs, ESLint, npm security checks, and optional SonarQube analysis. |
| 4 | **Resilience** | Handling external service failures (e.g., PokeAPI) gracefully through timeouts and retries. |

## Stakeholders

| Role | Expectation |
| :--- | :--- |
| **Instructors (SQA Course)** | Expect a well-documented project that demonstrates mastery of quality assurance techniques, including automated testing and CI/CD integration. |
| **Students (Developers)** | Aim to build a functional, maintainable, and well-tested application while learning SQA best practices. |
| **End Users** | Expect a stable, responsive application that helps them manage self-care tasks in a fun and engaging way. |
