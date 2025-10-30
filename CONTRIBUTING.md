# Contributing

This repo is used for development and as a portfolio showcase. Keep PRs focused and lightweight.

## Ground rules
- Prefer Docker-first workflow for local dev. Optional local Vite HMR is fine if it doesn’t interfere.
- Keep PRs small and focused (100–300 lines changed if possible).
- Use clear, imperative commit messages (e.g., "docs: add architecture overview").
- No secrets in code or logs. Use env vars and examples in docs.

## PR checklist
- [ ] Builds/tests pass locally (backend tests at minimum)
- [ ] Docs updated if needed (README/ARCHITECTURE_OVERVIEW)
- [ ] No secrets or sensitive data
- [ ] Screenshots or CLI examples if helpful

## Branching
- Base: `main` (protected)
- Feature branches: `feature/<short-name>` or `docs/<short-name>`
- Rebase before pushing when updating your branch with `main`

## Testing
- Backend: `cd backend && ./mvnw -q -DskipITs=false test`
- Frontend: run only if Vitest is present; otherwise skip.
- E2E: currently quarantined for demo scope.

## Conventions & References
- See `docs/CONFLUENCE.md` for coding conventions and workflow details.


