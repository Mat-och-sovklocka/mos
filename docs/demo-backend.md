# MOS Demo Backend Strategy

This repository ships a standalone demo mode that mocks the backend API directly in the browser so GitHub Pages can host a fully interactive walkthrough.

## Demo Mode Overview
- The Vite build flag `VITE_DEMO_MODE=true` enables a lightweight mock server (`frontend/src/demo/mockServer.js`) that intercepts `fetch` calls and serves predefined data stored in `localStorage`.
- Demo credentials:
  - Resident: `resident.demo@mos` / `demo123`
- The mock server persists reminder updates and meal preferences in the browser, so repeated visits keep the demo state until the user clears site data.

## Building the Demo Locally
```bash
cd frontend
VITE_DEMO_MODE=true npm run dev        # Live-reloads with mocked API
VITE_DEMO_MODE=true npm run build      # Produces dist/ ready for static hosting
```
> When `VITE_DEMO_MODE` is omitted or `false`, the frontend talks to the real API at `VITE_API_URL`.

## GitHub Pages Deployment
The `Deploy MOS Demo to GitHub Pages` workflow already exports `VITE_DEMO_MODE=true`, so the static site is self-contained and requires no backend.

## Resetting the Demo
- Reminders and meal requirements persist under the key `mos_demo_state_v1` in `localStorage`.
- In a desktop browser: open DevTools → Application → Local Storage → remove the key.
- On mobile Safari/Chrome: clear site data via browser settings to reset the demo.

## Quick Share (QR Code)
To let users install the PWA quickly:
```bash
npx qrcode-terminal https://mat-och-sovklocka.github.io/mos
```
They can scan the QR code, open the page, tap **Add to Home Screen**, and explore the fully mocked experience offline.
