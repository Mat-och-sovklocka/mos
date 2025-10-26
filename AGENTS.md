# Repository Guidelines

## Project Structure & Module Organization
The repository is split into `frontend/` (React + Vite) and `backend/` (Spring Boot). Frontend source lives in `frontend/src`, with UI components under `components/`, shared hooks in `hooks/`, and Playwright specs in `src/test/e2e/`. Backend code sits in `backend/src/main/java`, while configuration and Flyway migrations reside in `backend/src/main/resources`. Shared docs and API samples are kept in `docs/`, and generated Playwright artifacts land in `test-results/`.

## Build, Test, and Development Commands
- `docker-compose up`: bootstraps Postgres, backend, and frontend for a full-stack sandbox.
- `cd backend && ./mvnw spring-boot:run`: runs the API locally with hot reload.
- `cd frontend && npm run dev`: starts the Vite dev server against the local API.
- `cd frontend && npm run build`: produces the production-ready bundle.
- `npx playwright test`: executes end-to-end flows; add `--headed` when debugging.

## Coding Style & Naming Conventions
Frontend code follows the ESLint configuration invoked via `npm run lint`; keep 2-space indentation, PascalCase component files (e.g., `ReminderList.jsx`), and prefer custom hooks prefixed with `use`. Backend classes follow Spring conventions: 4-space indentation, `@Service`/`@Repository` separation, and Lombok for boilerplate. Use environment-aware config (`application.yml`, `application-dev.yml`) instead of hard-coded values, and keep shared constants in dedicated utility classes.

## Testing Guidelines
Write frontend unit tests with Vitest and Testing Library beside the code in `frontend/src/test/`. Backend tests belong under `backend/src/test/java`, leveraging Spring Boot Test and Mockito; use H2 profiles for data access coverage. Run `./mvnw test` and `npm run test -- --run` before every PR, and attach Playwright traces for any UI changes touching authentication or reminders.

## Commit & Pull Request Guidelines
Commit history mixes English and Swedish, but consistently uses short, imperative subjects (e.g., `Add reminder snooze logic`) and often links issues via `(#123)`. Group related changes per commit, include migration IDs in the subject when touching Flyway, and avoid “WIP” once pushed. PRs should describe the user-facing impact, list test commands run, link Jira/GitHub issues, and add screenshots or GIFs for UI modifications.

## Security & Configuration Tips
Use `.env.local` (copy `frontend/.env.local.example`) for overriding `VITE_API_URL`; never commit real secrets. Docker Compose provisions local Postgres with exposed ports—rotate credentials before deploying outside development. Keep JWT keys and mail credentials in platform-specific secret stores, and confirm that actuator endpoints remain disabled or authenticated in non-dev profiles.
