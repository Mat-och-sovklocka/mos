# Code Review Report

Generated: 2025-10-15

## Repository Overview
- Frontend: React + Vite app in `frontend/`
- Backend: Spring Boot (Java 21) in `backend/`
- Docker: `docker-compose.yaml` present
- Docs: extensive under `docs/`

## Frontend Findings

### Performance & Bundle
- Route-level code splitting implemented in `src/App.jsx` using `React.lazy` + `Suspense`.
- `react-datepicker` is lazy-loaded in `src/Reminders.jsx`.
- Images use `loading="lazy"` and `decoding="async"`. `Home.jsx` switched from CSS background-images to `<img>` for native lazy-loading.
- Bootstrap is imported once globally in `src/main.jsx`.
- Removed Font Awesome packages and global CSS import.

Recommendations:
- Convert large PNGs in `src/images` to WebP/AVIF and resize to displayed dimensions (~200px) to reduce >1MB assets dominating load.
- Add explicit `width` and `height` to `<img>` to minimize CLS.
- Consider purging Bootstrap or using a minimal CSS subset to reduce CSS payload (~31 kB gzip for `index.css`).

### Code Quality
- Console logging present in multiple modules (notifications, SW registration, error paths). Consider gating logs by env or using a logger.
- Alerts used for UX feedback in `Reminders.jsx` and `Reminderlist.jsx`; replace with non-blocking toasts/snackbars.
- TODOs in `Mealsuggestions.jsx`, `Form.jsx` indicate mock API usage; replace with real endpoints when available.
- `AuthContext.jsx` stores token in `sessionStorage` (OK for short-lived sessions); consider `httpOnly` cookies for stronger protection if server supports it.

### Security
- No `dangerouslySetInnerHTML`/raw `innerHTML` usage detected.
- All API calls use `getAuthHeaders()` for Authorization.
- Service Worker registration present; ensure `sw.js` and `manifest.json` exist in deployment if PWA features are desired.

## Backend Findings

### Security & Auth
- JWT setup via `JwtUtil`; secret loaded from config with default fallback `mySecretKey`. In `application-dev.yml`, a long secret is provided. Ensure production secrets are set via env and default is removed.
- Security config (`JwtSecurityConfig`) enforces stateless auth, exposes `/api/auth/login|logout`, enables CORS for dev origins. Consider enabling `@Profile` to avoid dev CORS in prod.
- Several controllers use `@CrossOrigin(origins = "http://localhost:3000")`. Prefer central CORS config (already present) and remove per-controller CORS to avoid drift. Add `5173` if using Vite.

### Logging & Error Handling
- Global API error handler `ApiErrors` returns structured 400 responses.
- `UserManagementService` contains `System.out.println` debug statements. Replace with a logger and remove debug lines.

### Password Handling
- User creation sets default passwords `defaultPassword123` with TODOs to generate secure passwords. This is unsafe beyond dev. Implement secure password generation + reset flow.
- BCrypt `PasswordEncoder` configured.

### Configuration
- `application-dev.yml` contains sample DB creds (`mos/mos`, `admin/admin`). Ensure these are dev-only and not used in prod.
- JWT `@Profile` annotations are commented out. Re-introduce profiles to separate dev/prod behavior.
- POM includes an unrelated dependency `com.github.lolgab:snunit-zio_native0.4_2.13` (Scala Native). It appears unused. Remove to reduce attack surface and build time.

### API & Permissions
- Reminder and MealRequirement controllers validate permissions via `UserPermissionService`. Auth header parsing uses `Bearer` token from header.
- UserManagementController enforces admin checks before admin operations; includes caregiver/caretaker permission checks.

## Actionable Checklist

Frontend:
- Replace alerts with a toast system.
- Gated logging based on environment.
- Convert heavy PNGs to WebP/AVIF and resize.
- Add image dimensions.

Backend:
- Replace default password usage; implement secure password generation and reset.
- Remove `System.out.println` debug lines.
- Re-enable `@Profile` for security/JWT config and remove per-controller `@CrossOrigin` in favor of centralized CORS.
- Remove unused `snunit-zio_native0.4_2.13` dependency from `pom.xml`.
- Ensure JWT secret never falls back to a weak default in production (require env var).

## Notable Files Reviewed
- Frontend: `src/App.jsx`, `src/Reminders.jsx`, `src/Reminderlist.jsx`, `src/Mealsuggestions.jsx`, `src/Home.jsx`, `src/contexts/AuthContext.jsx`.
- Backend: `JwtSecurityConfig`, `JwtUtil`, `AuthenticationController`, `ReminderController`, `MealRequirementController`, `UserManagementController`, `UserManagementService`, `ApiErrors`.

