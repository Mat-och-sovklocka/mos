# Java 17 + Maven, good for dev (runs mvn inside the container)
FROM maven:3.9-eclipse-temurin-21

# Workdir inside the container
WORKDIR /app

# Optional: pre-copy pom to warm the Maven cache on first build
COPY pom.xml ./
RUN mvn -q -e -DskipTests dependency:go-offline || true

# In dev we mount the whole ./backend folder via docker-compose volumes,
# so we DON'T copy source here. The container will see your local files.

EXPOSE 8080
# Compose overrides this, but having a default helps
CMD ["mvn", "spring-boot:run"]
