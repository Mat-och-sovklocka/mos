# Multi-User Testing Guide

## Overview
This guide provides better alternatives to constant copy/pasting of JWT tokens when testing multi-user functionality in the MOS API.

## Current Problem
- JWT tokens expire after 24 hours
- Manual copy/paste of tokens is tedious and error-prone
- Hard to maintain multiple user test scenarios

## Solutions

### Option 1: Environment Variables (Recommended)
**Best for:** Long-term testing, team collaboration

**Setup:**
1. Create a `.env` file in your project root:
```env
ADMIN_TOKEN=eyJhbGciOiJIUzUxMiJ9...
CAREGIVER_TOKEN=eyJhbGciOiJIUzUxMiJ9...
RESIDENT_TOKEN=eyJhbGciOiJIUzUxMiJ9...
```

2. Update your `api-testing.http` file:
```http
### Variables
@baseUrl = http://localhost:8080/api
@adminToken = {{$dotenv ADMIN_TOKEN}}
@caregiverToken = {{$dotenv CAREGIVER_TOKEN}}
@residentToken = {{$dotenv RESIDENT_TOKEN}}

### Test with environment variables
GET {{baseUrl}}/user-management/admin/users
Authorization: Bearer {{adminToken}}
```

**Benefits:**
- ✅ Tokens stored separately from test files
- ✅ Easy to refresh when expired
- ✅ Can be shared with team
- ✅ Works with most REST clients

### Option 2: Auto-Login Script
**Best for:** Quick testing, always fresh tokens

```http
### Auto-login and store tokens
@adminToken = 
@caregiverToken = 
@residentToken = 

### Login as Admin and store token
# @name adminLogin
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@mos.test",
  "password": "password123"
}

### Extract token from response
@adminToken = {{adminLogin.response.body.token}}

### Now use the token
GET {{baseUrl}}/user-management/admin/users
Authorization: Bearer {{adminToken}}
```

**Benefits:**
- ✅ Always fresh tokens
- ✅ No manual token management
- ✅ Self-contained in test file

### Option 3: Token Refresh Script
**Best for:** Automated token management

Create `refresh-tokens.sh`:
```bash
#!/bin/bash
echo "Refreshing tokens..."

# Login and extract tokens
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mos.test","password":"password123"}' | jq -r '.token')

CAREGIVER_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"caregiver1@mos.test","password":"password123"}' | jq -r '.token')

RESIDENT_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"resident1@mos.test","password":"password123"}' | jq -r '.token')

echo "ADMIN_TOKEN=$ADMIN_TOKEN" > .env
echo "CAREGIVER_TOKEN=$CAREGIVER_TOKEN" >> .env
echo "RESIDENT_TOKEN=$RESIDENT_TOKEN" >> .env

echo "Tokens refreshed!"
```

**Usage:**
```bash
chmod +x refresh-tokens.sh
./refresh-tokens.sh
```

### Option 4: VS Code REST Client Extensions
**Best for:** GUI-based testing

**Recommended Extensions:**
- **Thunder Client** - Built-in environment management
- **REST Client** - Supports environment files
- **Postman** - Full-featured API testing

### Option 5: Pre-request Scripts (Advanced)
**Best for:** Complex test scenarios

```http
### Login and get token in one go
# @name login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@mos.test",
  "password": "password123"
}

### Use the token immediately
GET {{baseUrl}}/user-management/admin/users
Authorization: Bearer {{login.response.body.token}}
```

## Test User Credentials

### Admin User
- **Email:** `admin@mos.test`
- **Password:** `password123`
- **Permissions:** All permissions

### Caregiver User
- **Email:** `caregiver1@mos.test`
- **Password:** `password123`
- **Permissions:** CREATE_REMINDERS, VIEW_REMINDERS, MEAL_REQUIREMENTS

### Resident User
- **Email:** `resident1@mos.test`
- **Password:** `password123`
- **Permissions:** VIEW_REMINDERS

## Implementation Steps

### For Environment Variables (Recommended):
1. Create `.env` file with current tokens
2. Update `api-testing.http` to use environment variables
3. Add `.env` to `.gitignore` (don't commit tokens)
4. Create `.env.example` with placeholder values
5. Document the setup process

### For Auto-Login Script:
1. Add login requests at the top of test file
2. Use `# @name` to capture responses
3. Extract tokens using response body syntax
4. Use extracted tokens in subsequent requests

## Best Practices

1. **Never commit tokens** to version control
2. **Use environment variables** for sensitive data
3. **Document token refresh process** for team members
4. **Test with different user types** to verify permissions
5. **Keep test data consistent** across environments

## Troubleshooting

### Common Issues:
- **Token expired:** Refresh tokens using login requests
- **Environment variables not working:** Check REST client extension support
- **Permission denied:** Verify user type and permissions
- **Login failing:** Check user credentials and backend status

### Quick Token Refresh:
```http
### Quick token refresh for testing
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@mos.test",
  "password": "password123"
}
```

## Next Steps

1. **Choose your preferred method** (Environment Variables recommended)
2. **Set up the chosen approach** in your test files
3. **Test with all user types** to verify functionality
4. **Document the process** for your team
5. **Automate token refresh** if needed

---

**Created:** 2025-01-15  
**Last Updated:** 2025-01-15  
**Status:** Ready for implementation
