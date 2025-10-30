## MOS – Mat och Sovklocka

![CI](https://github.com/Mat-och-sovklocka/mos/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A lightweight reminder app for meals and sleep with an offline-first PWA demo and a Docker-first development workflow.

### Highlights
- PWA demo (offline, Add to Home Screen, native-like feel)
- Simple role-based access (Caregiver/Resident)
- LocalStorage-backed demo data, no backend required for demo
- Optional notification simulation in demo mode
- Full backend available (Spring Boot + Postgres) for real environments

### Live Demo (GitHub Pages)
- Branch: `feature/gh-pages-demo`
- URL: `https://mat-och-sovklocka.github.io/mos/`
- Demo login (shown in app): Caregiver (Erik) and Resident (Anna)
- Note: The demo runs entirely in the browser and works offline once loaded.

If you install to your home screen on Android/iOS, the app will behave like a native app (standalone, icon, splash). Swedish demo instructions are shown on the demo landing page.

### Quickstart (Docker-first)
Prerequisites: Docker + Docker Compose

```bash
docker-compose up --build
```

- Backend: Spring Boot with hot reload (`backend/`)
- Frontend: Vite dev server proxied through Docker (`frontend/`)

If you prefer running the frontend locally (for Vite HMR), ensure it does not conflict with Docker networking. The repo defaults to Docker-first; see `docs/` for notes on local HMR tradeoffs.

### Tech Stack
- Frontend: React + Vite, PWA (Service Worker + Manifest)
- Backend: Spring Boot, Flyway, Postgres (Docker)
- CI/CD: GitHub Actions (Node 20), GitHub Pages for demo branch

### Repository Structure
```
backend/        # Spring Boot API
frontend/       # React + Vite app
docs/           # Guides and internal documentation
.github/        # Workflows (demo deploy on dedicated branch)
```

### Development
- Frontend dev (Docker): `docker-compose up --build`
- Frontend dev (local) optional: `cd frontend && npm ci && npm run dev`
  - Use only if you need local HMR; Docker remains the source of truth.
- Backend dev: `cd backend && ./mvnw spring-boot:run`

### Testing
- Backend: `cd backend && ./mvnw test`
- Frontend unit: `cd frontend && npm run test -- --run` (if enabled)
- E2E: Playwright specs exist historically; see `docs/` for current status. Some tests may be quarantined as demo-scope evolved.

### Documentation
- Production readiness checklist: `docs/PRODUCTION_READINESS_REQUIREMENTS.md`
- Architecture overview: `docs/ARCHITECTURE_OVERVIEW.md`
- Confluence links (SSOT): `docs/CONFLUENCE.md`
- PWA/Notifications overview: `docs/guides/PWA_IMPLEMENTATION_GUIDE.md`
 - Changelog: `CHANGELOG.md`

### Developer workflow (Docker-first)
- Preferred: run full stack with Docker (`docker-compose up --build`).
- Optional: local frontend HMR with Vite is supported but secondary; see `docs/guides/dev-cheatsheet.md` for tradeoffs and tips.

### Demo Mode Notes
- `VITE_DEMO_MODE=true` enables:
  - LocalStorage persistence for reminders/users
  - Foreground notification simulation and missed-reminder checks
- The demo deployment uses a fixed base path for GitHub Pages.

### License and Contributions
- License: MIT (or project default)
- Contributions: Please use short, imperative commit messages and PRs with a brief user-facing summary. See `CONTRIBUTING.md` (if present) and Confluence for conventions.

# Mat och Sovklocka (MOS) - Meal and Sleep Reminder System

A full-stack application for managing meal reminders and sleep schedules, designed for care facilities and residents.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20.19+ (for local development)

### Running the Application
```bash
# Start all services (database, backend, frontend)
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5432
```

### Demo Credentials
- **Admin**: `admin@mos.test` / `password123`
- **Resident**: `resident1@mos.test` / `password123`

## 🏗️ Architecture

### Frontend (React + Vite)
- **Port**: 3000
- **Tech Stack**: React, React Router, Bootstrap
- **Features**: 
  - JWT-based authentication
  - Responsive design
  - PWA capabilities
  - Real-time notifications

### Backend (Spring Boot)
- **Port**: 8080
- **Tech Stack**: Java 17, Spring Boot, Spring Security
- **Database**: PostgreSQL
- **Features**:
  - RESTful API
  - JWT authentication
  - User management (Admin, Caregiver, Resident roles)
  - Reminder system

### Database (PostgreSQL)
- **Port**: 5432
- **Features**: User management, reminders, meal requirements

## 🧪 Testing

### E2E Tests (Playwright)
```bash
# Run all tests
npx playwright test

# Run specific test
npx playwright test frontend/e2e/auth-flow.spec.js

# Run in headed mode
npx playwright test --headed
```

**Current Status**: ✅ Authentication tests passing in Chrome/Safari, ⚠️ Firefox has known issues

## 📁 Project Structure

```
mos/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── e2e/           # Playwright E2E tests
│   │   └── ...
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Spring Boot backend
│   ├── src/main/java/     # Java source code
│   ├── src/main/resources/ # Configuration & migrations
│   ├── src/test/          # Unit tests
│   └── pom.xml
│
├── docs/                  # Documentation
│   ├── api-testing.http   # API test requests
│   ├── kravspec_mos.md    # Requirements specification
│   └── ...
│
├── docker-compose.yaml    # Multi-service setup
└── README.md
```

## 🔧 Development

### Local Development
```bash
# Backend only
cd backend && mvn spring-boot:run

# Frontend only (requires backend running)
cd frontend && npm run dev
```

### API Testing
Use the provided HTTP files in `docs/api-testing.http` to test endpoints.

## 📋 Current Features

- ✅ User authentication (JWT)
- ✅ Role-based access (Admin, Caregiver, Resident)
- ✅ Reminder management
- ✅ Responsive UI
- ✅ E2E test coverage
- 🔄 Meal suggestions (in development)
- 🔄 Statistics dashboard (planned)

## 🐛 Known Issues

- Firefox browser compatibility issues (500 errors on login)
- Node.js version warning (requires 20.19+)

## 📚 Documentation

See the `docs/` folder for detailed documentation:
- API endpoints and testing
- Authentication flow
- Development setup guides
- Requirements specification
- Demo backend strategy (`docs/demo-backend.md`)
