# Frontend Testing Setup - MOS Project

## Overview
The MOS (mat och sovklocka) application uses **unit testing only** with Vitest and React Testing Library for fast, reliable testing of individual components.

## Testing Stack
- **Vitest** - Fast test runner (Vite-native)
- **React Testing Library** - Component testing utilities
- **jsdom** - DOM simulation for tests

## Installation

### Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

## Running Tests

### Unit Tests
```bash
# Run all tests once
npm run test:run

# Run tests in watch mode (re-runs on file changes)
npm run test

# Run tests with UI (if @vitest/ui is installed)
npm run test:ui
```

## Test Structure
```
frontend/src/test/
├── setup.js              # Global test setup
├── Login.test.jsx        # Login component tests
└── ReminderList.test.jsx # Reminder list component tests
```

## What We Test
- **Component rendering** - UI elements display correctly
- **User interactions** - Form submissions, button clicks
- **API integration** - Mocked fetch calls and responses
- **State management** - Loading states, error handling

## Manual Testing Checklist
Since E2E tests are not automated, use this checklist for manual testing:

### Critical User Flows
- [ ] **Login Flow**
  - [ ] Can login with admin credentials (admin@mos.test / password123)
  - [ ] Can login with resident credentials (resident1@mos.test / password123)
  - [ ] Shows error for invalid credentials
  - [ ] Redirects to home page after successful login

- [ ] **Reminder Creation**
  - [ ] Can create one-time reminders
  - [ ] Can create recurring reminders
  - [ ] All categories work correctly (Måltider, Medicin, Dusch, etc.)
  - [ ] Date/time picker works properly

- [ ] **Reminder Management**
  - [ ] Can view reminder list
  - [ ] Can edit existing reminders
  - [ ] Can delete reminders
  - [ ] Changes persist after page refresh

- [ ] **Navigation**
  - [ ] Can navigate between pages
  - [ ] Can logout and return to login page
  - [ ] Browser back/forward buttons work

### Browser Testing
Test in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge

### Mobile Testing
- [ ] Responsive design works on mobile
- [ ] Touch interactions work properly
- [ ] PWA features work (if applicable)

## Troubleshooting

### Common Issues
1. **Dependency conflicts**: Use `npm install --legacy-peer-deps` or `npm install --force`
2. **Test warnings**: `act()` warnings are cosmetic and don't affect functionality
3. **Mock issues**: Ensure fetch is properly mocked in tests

### Test Commands Reference
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Run specific test file
npm run test:run -- Login.test.jsx

# Run tests with coverage
npm run test:run -- --coverage
```

## Why No E2E Tests?
- **Small project scope** - Manual testing is faster for this size
- **Dependency complexity** - E2E tools add maintenance overhead
- **Unit tests provide coverage** - Component logic is well-tested
- **Demo-proven** - Application works reliably in real usage

The unit tests catch component-level bugs and provide confidence during development, while manual testing ensures the full user experience works correctly.