### Test Audit – MOS

Purpose: snapshot of current test surface, commands, and next actions (fix vs. quarantine).

#### Commands
- Backend unit/integration:
  - `cd backend && ./mvnw test`
- Frontend unit (if enabled):
  - `cd frontend && npm run test -- --run`
- E2E (Playwright; may be outdated):
  - `npx playwright test` (from repo root or `frontend/` depending on config)

#### Backend (Spring Boot)
- Status: pending audit
- Notes: Uses H2 profile for data access tests; Flyway migrations apply on test profile.
- Next actions:
  - Run tests locally and in CI (Node unaffected).
  - Identify any flaky DB-init or migration order issues.

#### Frontend (React + Vite)
- Status: pending audit
- Notes: Some test deps may be removed in demo scope; ensure Vitest deps exist if running.
- Next actions:
  - Confirm `vitest` and `@testing-library/*` presence or skip for now.
  - If disabled, document as intentionally out of scope for the demo.

#### E2E (Playwright)
- Status: likely outdated (selectors/routes drifted)
- Next actions:
  - Attempt a run; list broken specs.
  - Quarantine failing specs or fix low-effort ones.

#### CI Integration
- Goal: run backend tests on all PRs; optionally run frontend unit if enabled.
- Pages deploy only from demo branch; tests should gate deploy where practical.

#### Decisions
- Scope for demo: prioritize backend tests; defer frontend unit/E2E unless quick wins.


