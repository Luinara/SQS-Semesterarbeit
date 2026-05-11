# Constraints

This section describes the technical, organizational, and political constraints that influence the architecture of the self-care companion application.

## Technical Constraints

| Constraint | Description |
| :--- | :--- |
| **Java Platform** | The backend must be developed using Java 21 or higher. |
| **Spring Boot Framework** | Spring Boot 3 is the mandatory framework for the backend application. |
| **Database System** | PostgreSQL is used for persistent data storage; H2 is used as an in-memory database for testing. |
| **Frontend Stack** | The user interface must be built with React 18 and TypeScript, using Vite as the build tool. |
| **External Integration** | Integration with the PokeAPI (REST) is required for gamification elements. |
| **Containerization** | The application must be deployable via Docker and Docker Compose to ensure environmental consistency. |
| **CI/CD Pipeline** | Automated build and test pipelines must be implemented using GitHub Actions. |
| **Quality Analysis** | SonarQube is used for static code analysis and enforcing quality gates. |

## Organizational Constraints

| Constraint | Description |
| :--- | :--- |
| **Project Context** | Developed as a semester project for the Software Quality Assurance (SQS) course. |
| **Team** | Small team of student developers. |
| **Schedule** | Project completion must be achieved within the current academic semester. |
| **Quality Requirements** | Strict adherence to high software quality standards, including high test coverage (≥80%) and automated testing at multiple levels. |
| **Documentation** | Mandatory use of the arc42 template for architecture documentation and ADRs for major decisions. |

## Political and Regulatory Constraints

| Constraint | Description |
| :--- | :--- |
| **Academic Integrity** | Adherence to university guidelines on academic integrity and original work. |
| **Open Source** | Preference for open-source libraries and public APIs (like PokeAPI). |
| **Data Privacy** | Basic consideration of data privacy for user-related information (e.g., password hashing). |
