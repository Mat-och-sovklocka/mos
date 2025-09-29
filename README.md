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