# Security Notes (minimal)

- Do not commit secrets. Use environment variables; see `.env.example` files.
- Frontend must never contain real secrets; everything shipped to the browser is public.
- Backend secrets (DB creds, JWT secret) should be provided via env vars or Docker secrets.
- Flyway migrations are immutable; use new versioned files for changes.
- If a secret was committed accidentally, rotate it and purge from history.

## Recommended env variables
- Backend:
  - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
  - `JWT_SECRET`
- Frontend:
  - `VITE_BASE_PATH`, `VITE_DEMO_MODE`, `VITE_API_BASE_URL`

## Git hygiene
- `.gitignore` blocks `.env` files by default.
- Review PRs for logs or code that might expose secrets.
