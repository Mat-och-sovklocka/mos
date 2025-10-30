# Architecture Overview

This document summarizes the MOS system at a high level: components, data flow, demo/PWA specifics, and CI/CD.

## Components
- Frontend: React + Vite (PWA)
  - Service Worker and Manifest for offline and Add-to-Home-Screen
  - Demo mode (`VITE_DEMO_MODE=true`) uses LocalStorage to simulate backend
- Backend: Spring Boot (Java 17)
  - REST API, DTOs, validation, and Flyway migrations
  - Runs in Docker with Postgres
- Database: Postgres (Docker)
  - Flyway-managed schema changes
- CI/CD: GitHub Actions
  - Minimal CI for tests (docs/ci.md)
  - GitHub Pages deployment on a dedicated demo branch

## Data Flow (Real Environment)
1. UI (React) calls REST endpoints via fetch/axios
2. Spring Boot controllers → service layer → repositories
3. JPA/Hibernate persists to Postgres
4. Responses serialized as DTOs

## Data Flow (Demo Mode)
1. UI (React) calls simulated API functions
2. LocalStorage stores users/reminders/assignments
3. Notification timers run in-foreground; missed reminders checked on app open

## PWA & Offline
- Service Worker caches static assets and basic pages
- Manifest defines icons, theme, scope, and standalone display
- GitHub Pages requires correct Vite base path for assets

## Notifications (Adapter Pattern)
- `NotificationAdapter` interface
- Web/PWA adapter:
  - Requests Notification permission
  - Schedules foreground timers while app is open
  - `checkAndShowMissedReminders()` on startup/intervals
- Capacitor adapter (placeholder for native/mobile builds)

## Environments
- Local (Docker-first): run full stack via docker-compose
- Local frontend (optional): Vite dev server can run outside Docker for HMR; use with care
- Demo (Pages): static build with demo mode enabled

## Security & Secrets
- No secrets in frontend bundle
- Backend uses environment variables / Docker secrets
- Never commit `.env` files; provide `.env.example` if needed

## Testing
- Backend: JUnit/Mockito/H2 for unit/integration tests
- Frontend: optional Vitest/RTL (skipped if not installed)
- E2E: Playwright (currently quarantined for demo)

## CI/CD (Minimal)
- Run backend tests on PRs to `main`
- Optionally run frontend unit tests if Vitest present
- Demo deploy kept to dedicated branch; not part of main CI

## Future Improvements
- Re-introduce a small, stable E2E smoke flow
- Harden SW caching strategy and offline routes
- Expand notification scheduling beyond foreground timers when packaged natively


