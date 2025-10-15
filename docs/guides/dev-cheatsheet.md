# Dev Cheat-Sheet

Minimal set of commands we've actually used for running, inspecting, and testing the project.

## Containers

```bash
# List running containers
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

# Start everything (from project root)
docker compose up --build

# Stop containers
docker compose down

# Stop + clear DB volume (fresh start)
docker compose down -v

# Clear just buildx cache (what we used before)
docker buildx prune --all --force

# Clear all Docker cache (more aggressive)
docker system prune --all --force

# Clear Docker Compose cache specifically
docker-compose down --volumes --remove-orphans
```

## Postgres inside Docker

```bash
# Open interactive psql
docker exec -it db psql -U mos -d mos

# One-liners
docker exec -it db psql -U mos -d mos -c "select current_database(), current_schema();"
docker exec -it db psql -U mos -d mos -c "\dt"
docker exec -it db psql -U mos -d mos -c "select * from flyway_schema_history;"
docker exec -it db psql -U mos -d mos -c "select * from app_user;"
docker exec -it db psql -U mos -d mos -c "select * from user_assignments;"
docker exec -it db psql -U mos -d mos -c "select count(*) from reminder;"
docker exec -it db psql -U mos -d mos -c "select r.*, u.email from reminder r join app_user u on r.user_id = u.id;"
# Count all users
docker exec -it db psql -U mos -d mos -c "SELECT COUNT(*) FROM app_user;"

# Count by user type
docker exec -it db psql -U mos -d mos -c "SELECT user_type, COUNT(*) FROM app_user GROUP BY user_type;"

# Count active users
docker exec -it db psql -U mos -d mos -c "SELECT COUNT(*) FROM app_user WHERE is_active = true;"
```

### Useful psql interactive commands

```bash
# Once inside psql (docker exec -it db psql -U mos -d mos)
-- List tables
\dt

-- Describe a table (columns + types)
\d app_user
\d reminder

-- See all users
select * from app_user;

-- See latest reminders
select id, user_id, time_at, category, note, type, recurrence, created_at
from reminder
order by created_at desc
limit 10;

-- Filter reminders by user
select * from reminder where user_id = '<USER_UUID>';

-- Quit psql
\q
```

## API Testing

```bash
# Swagger UI (in browser)
http://localhost:8080/swagger-ui/index.html

# Export static spec
curl http://localhost:8080/v3/api-docs.yaml > docs/openapi.yaml
```

## Build helpers

```bash
# Build backend JAR
mvn -q -DskipTests clean package

# Install frontend deps inside container (first time)
docker compose run --rm frontend npm ci
```
