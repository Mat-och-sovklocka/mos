# MOS API Documentation

## Overview
API for managing meal requirements, reminders, and user authentication

**Version:** 1.0.0  
**Base URL:** `http://localhost:8080` (Development)  
**Authentication:** Bearer Token (JWT)

## Authentication

### Login
**POST** `/api/auth/login`

Authenticate a user and return a JWT token.

**Request Body:**
```json
{
  "email": "admin@mos.test",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "email": "admin@mos.test",
  "displayName": "System Administrator",
  "userType": "ADMIN",
  "expiresAt": "2025-09-23T09:20:54Z"
}
```

### Get Current User
**GET** `/api/auth/me`

Retrieve details of the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "admin@mos.test",
  "displayName": "System Administrator",
  "userType": "ADMIN",
  "isActive": true,
  "createdAt": "2025-09-22T09:13:56.743059+00"
}
```

## Reminders

### Get User Reminders
**GET** `/api/users/{userId}/reminders`

Retrieve all reminders for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Responses:**
- **200:** List of reminders
- **403:** Forbidden - No permission to view reminders

### Create Reminder
**POST** `/api/users/{userId}/reminders`

Create a new reminder.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "måltider",
  "category": "MEAL",
  "dateTime": "2025-09-22T12:00:00Z",
  "note": "Lunch reminder"
}
```

**Responses:**
- **201:** Reminder created
- **400:** Invalid input
- **403:** Forbidden - No permission to create reminders

### Update Reminder
**PUT** `/api/users/{userId}/reminders/{reminderId}`

Update an existing reminder.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "once",
  "category": "medicin",
  "dateTime": "2025-09-27T14:30:00Z",
  "note": "Updated medication reminder"
}
```

**Responses:**
- **200:** Reminder updated
- **400:** Invalid input
- **403:** Forbidden - No permission to update reminders
- **404:** Reminder not found

### Delete Reminder
**DELETE** `/api/users/{userId}/reminders/{reminderId}`

Delete a specific reminder.

**Headers:** `Authorization: Bearer <token>`

**Responses:**
- **204:** No Content
- **403:** Forbidden - No permission to delete reminders

## Meal Requirements

### Get Meal Requirements
**GET** `/api/users/{userId}/meal-requirements`

Retrieve all meal requirements for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Responses:**
- **200:** List of meal requirements
- **403:** Forbidden - No permission to view meal requirements

### Set Meal Requirements
**POST** `/api/users/{userId}/meal-requirements`

Set meal requirements for a user (replaces all existing).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "requirements": ["Laktosfri", "Diabetesanpassad"]
}
```

**Responses:**
- **201:** Meal requirements set successfully
- **400:** Invalid input
- **403:** Forbidden - No permission to manage meal requirements

## User Management

### Create Caretaker
**POST** `/api/user-management/caretakers`

Create a new caretaker user and assign them to the current caregiver.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "email": "john.doe@example.com",
  "displayName": "John Doe",
  "userType": "RESIDENT",
  "isActive": true,
  "createdAt": "2025-10-07T11:35:30.000Z"
}
```

### List Caretakers
**GET** `/api/user-management/caretakers`

Get all caretakers assigned to the current caregiver.

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of User objects

### Get Caretaker Permissions
**GET** `/api/user-management/caretakers/{caretakerId}/permissions`

Get all permissions for a specific caretaker.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
["CREATE_REMINDERS", "VIEW_REMINDERS", "MEAL_REQUIREMENTS"]
```

### Set Caretaker Permissions
**PUT** `/api/user-management/caretakers/{caretakerId}/permissions`

Set permissions for a specific caretaker.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "permissions": ["CREATE_REMINDERS", "VIEW_REMINDERS"]
}
```

**Responses:**
- **200:** Permissions updated successfully
- **403:** Forbidden - Caretaker not assigned to current caregiver

### Delete Caretaker
**DELETE** `/api/user-management/caretakers/{caretakerId}`

Delete a caretaker and remove all their assignments.

**Headers:** `Authorization: Bearer <token>`

**Responses:**
- **200:** Caretaker deleted successfully
- **403:** Forbidden - Caretaker not assigned to current caregiver

### Get Current User Permissions
**GET** `/api/user-management/permissions`

Get all permissions for the current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
["CREATE_REMINDERS", "VIEW_REMINDERS", "MEAL_REQUIREMENTS"]
```

### Create User (Admin Only)
**POST** `/api/user-management/admin/users`

Create a new user of any type (ADMIN, CAREGIVER, RESIDENT) with automatic permission assignment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@mos.test",
  "userType": "ADMIN"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "email": "newadmin@mos.test",
  "displayName": "New Admin",
  "userType": "ADMIN",
  "isActive": true,
  "createdAt": "2025-10-07T11:35:30.000Z"
}
```

**Responses:**
- **200:** User created successfully
- **400:** Bad request (e.g., email already exists)
- **401:** Unauthorized
- **403:** Forbidden - Only admins can create users

**User Type Examples:**
- **ADMIN:** Gets all permissions (VIEW_REMINDERS, CREATE_REMINDERS, MEAL_REQUIREMENTS)
- **CAREGIVER:** Gets management permissions (VIEW_REMINDERS, CREATE_REMINDERS, MEAL_REQUIREMENTS)
- **RESIDENT:** Gets basic permissions (VIEW_REMINDERS)

## Permission Types

- **`CREATE_REMINDERS`** - Create, edit, and delete reminders
- **`VIEW_REMINDERS`** - View reminder lists
- **`MEAL_REQUIREMENTS`** - Access and manage meal requirements
- **`MEAL_SUGGESTIONS`** - Access meal suggestions (not implemented yet)
- **`STATISTICS`** - View statistics (not implemented yet)

## User Types

- **`ADMIN`** - System administrators with full access
- **`CAREGIVER`** - Manages caretakers and assigns permissions
- **`RESIDENT`** - End users with limited permissions

## Error Responses

All endpoints may return these error responses:

- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - User doesn't have required permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

**Error Response Format:**
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to create reminders"
}
```

## Data Models

### User
```json
{
  "id": "uuid",
  "email": "string",
  "displayName": "string",
  "userType": "ADMIN|CAREGIVER|RESIDENT",
  "isActive": "boolean",
  "createdAt": "datetime"
}
```

### Reminder
```json
{
  "id": "uuid",
  "time": "datetime",
  "category": "MEDICATION|MEAL",
  "note": "string",
  "createdAt": "datetime"
}
```

### Meal Requirement
```json
{
  "id": "uuid",
  "requirement": "string",
  "createdAt": "datetime"
}
```
