### CI – Minimal Test Gate (Docs Only)

This is a minimal GitHub Actions workflow snippet you can copy into `.github/workflows/ci.yml` to show a working test pipeline without touching the demo deployment setup.

```yaml
name: CI (minimal tests)

on:
  pull_request:
    branches: [ main ]

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - name: Backend tests
        run: |
          cd backend
          ./mvnw -q -DskipITs=false test

      - name: Node.js (optional for frontend tests)
        uses: actions/setup-node@v4
        with:
          node-version: '20.19.0'

      - name: Frontend unit tests (if available)
        run: |
          cd frontend
          if [ -f package.json ] && jq -er '.devDependencies.vitest // .dependencies.vitest' package.json >/dev/null 2>&1; then \
            npm ci --legacy-peer-deps && npm run test -- --run; \
          else \
            echo "Vitest not present — skipping frontend unit tests"; \
          fi
```

Notes
- Keeps the demo deploy separate (no Pages steps here).
- Backend tests always run; frontend tests run only if `vitest` is present.

