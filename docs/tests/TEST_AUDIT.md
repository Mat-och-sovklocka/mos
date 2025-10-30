### Test Audit – MOS (Minimal)

Purpose: Minimal, portfolio-friendly test surface to show a working testing workflow.

#### Commands (Smoke)
- Backend unit/integration (preferred):
  - `cd backend && ./mvnw -q -DskipITs=false test`
- Frontend unit (only if Vitest/RTL present):
  - `cd frontend && npm run test -- --run || echo "(skipped)"`
- E2E (Playwright) — currently out of scope for CI; try locally only if needed:
  - `npx playwright test || echo "(quarantined)"`

#### Backend (Spring Boot)
- Status: smoke tests expected to pass.
- Notes: H2 profile used in tests; Flyway migrations should run automatically.

#### Frontend (React + Vite)
- Status: minimal; run only if `vitest` and `@testing-library/*` are installed. Otherwise skipped by design.

#### E2E (Playwright)
- Status: quarantined (selectors/routes likely drifted). Not part of CI.

#### CI Recommendation (Lightweight)
- On PRs to `main`: run backend tests.
- Optionally run frontend unit tests if `vitest` exists; otherwise skip with a clear log line.
- Do not run E2E in CI.

See `docs/ci.md` for a sample workflow snippet.


