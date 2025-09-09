# Dev Cheat-Sheet

Minimal set of commands we’ve actually used for running, inspecting, and testing the project.

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
```

## Postgres inside Docker

```bash
# Open interactive psql
docker exec -it db psql -U mos -d mos

# One-liners
docker exec -it db psql -U mos -d mos -c "select current_database(), current_schema();"
docker exec -it db psql -U mos -d mos -c "\dt"
docker exec -it db psql -U mos -d mos -c "select * from flyway_schema_history;"
```

### Seeding / inspecting data
```bash
# Insert demo user (stable UUID)
docker exec -it db psql -U mos -d mos -c \
"insert into app_user (id,email,display_name,password_hash,created_at)
 values ('11111111-1111-1111-1111-111111111111','demo@local','Demo','x', now())
 on conflict (email) do nothing;"

# Get demo user id
docker exec -it db psql -U mos -d mos -c \
"select id, email from app_user where email='demo@local';"

# Inspect reminders
docker exec -it db psql -U mos -d mos -c \
"select id, user_id, time_at, category, note, type, recurrence, created_at
 from reminder order by created_at desc limit 10;"
```

## API smoke tests (SecurityDevConfig active → no auth needed)

```bash
# Create once
curl -H "Content-Type: application/json" \
  -d '{"type":"once","category":"MEAL","dateTime":"2025-09-17T15:00:00Z","note":"lunch"}' \
  http://localhost:8080/api/users/<USER_UUID>/reminders

# Create recurring
curl -H "Content-Type: application/json" \
  -d '{"type":"recurring","category":"MEAL","days":["WED","THU"],"times":["11:11"],"note":"weekly"}' \
  http://localhost:8080/api/users/<USER_UUID>/reminders

# List reminders
curl http://localhost:8080/api/users/<USER_UUID>/reminders

# Delete reminder
curl -X DELETE http://localhost:8080/api/users/<USER_UUID>/reminders/<REMINDER_UUID>
```

## Swagger / OpenAPI

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
