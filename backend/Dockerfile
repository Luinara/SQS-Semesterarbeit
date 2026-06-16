FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app
ENV MAVEN_OPTS="-XX:ActiveProcessorCount=2 -XX:ParallelGCThreads=1 -XX:ConcGCThreads=1 -Xmx768m"
COPY pom.xml .
COPY src ./src
RUN mvn --batch-mode --no-transfer-progress -T 1 -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN groupadd --system app && useradd --system --gid app --home-dir /app app \
    && chown -R app:app /app
USER app

EXPOSE 8181
ENTRYPOINT ["java", "-jar", "app.jar"]
