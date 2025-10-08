# User Permissions System Implementation Guide

## Overview

This document provides a comprehensive guide to the user permissions system implemented in the MoS application. The system allows caregivers to manage caretakers and control their access to different features.

## Architecture

### User Types
- **Admin**: System administrators with full access
- **Caregiver**: Manages one or more caretakers, assigns permissions
- **Caretaker**: End users with limited permissions based on caregiver assignments

### Core Components

#### 1. Database Schema
- **`user_permissions`**: Stores individual permissions for each user
- **`user_assignments`**: Manages caregiver-caretaker relationships

#### 2. Entities
- **`UserPermission`**: Represents a single permission for a user
- **`UserAssignment`**: Represents a caregiver-caretaker relationship

#### 3. Services
- **`UserPermissionService`**: Handles permission checking and management
- **`UserManagementService`**: Manages user creation and assignments

#### 4. Controllers
- **`UserManagementController`**: API endpoints for caregiver operations
- **Updated existing controllers**: Added permission checks to reminder and meal requirement endpoints

## API Endpoints

### User Management (Caregiver Operations)

#### Create Caretaker
```http
POST /api/user-management/caretakers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

#### List Caretakers
```http
GET /api/user-management/caretakers
Authorization: Bearer <token>
```

#### Get Caretaker Permissions
```http
GET /api/user-management/caretakers/{caretakerId}/permissions
Authorization: Bearer <token>
```

#### Set Caretaker Permissions
```http
PUT /api/user-management/caretakers/{caretakerId}/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissions": ["CREATE_REMINDERS", "VIEW_REMINDERS", "MEAL_REQUIREMENTS"]
}
```

#### Delete Caretaker
```http
DELETE /api/user-management/caretakers/{caretakerId}
Authorization: Bearer <token>
```

#### Get Current User Permissions
```http
GET /api/user-management/permissions
Authorization: Bearer <token>
```

## Permission Types

### Available Permissions
- **`CREATE_REMINDERS`**: Create, edit, and delete reminders
- **`VIEW_REMINDERS`**: View reminder lists
- **`MEAL_REQUIREMENTS`**: Access and manage meal requirements
- **`MEAL_SUGGESTIONS`**: Access meal suggestions (not implemented yet)
- **`STATISTICS`**: View statistics (not implemented yet)

### Default Permissions by User Type

#### Admin Users
- All permissions enabled by default

#### Caregiver Users
- `CREATE_REMINDERS`
- `VIEW_REMINDERS`
- `MEAL_REQUIREMENTS`

#### Resident/Caretaker Users
- `VIEW_REMINDERS` (basic access)

## Database Migration

The system includes a Flyway migration (`V9__add_user_permissions_and_assignments.sql`) that:
1. Creates the `user_permissions` and `user_assignments` tables
2. Adds proper indexes for performance
3. Sets up default permissions for existing users

## Security Implementation

### Permission Checking
All protected endpoints now include permission verification:

```java
UUID currentUserId = getCurrentUserId(authHeader);
if (!hasPermission(currentUserId, PermissionConstants.CREATE_REMINDERS)) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
        "error", "Forbidden",
        "message", "You don't have permission to create reminders"
    ));
}
```

### JWT Integration
- User ID extracted from JWT token
- Permissions checked against database
- Consistent error responses for unauthorized access

## Frontend Integration

### Required Changes
1. **Update API calls** to include `Authorization` header
2. **Handle 403 Forbidden** responses gracefully
3. **Connect to new endpoints** for user management
4. **Implement permission-based UI** showing/hiding features

### Example Frontend Code
```javascript
// Check if user has permission
const hasPermission = (permission) => {
  return userPermissions.includes(permission);
};

// Conditional rendering
{hasPermission('CREATE_REMINDERS') && (
  <button onClick={createReminder}>Create Reminder</button>
)}
```

## Testing

### Manual Testing Steps
1. **Login as caregiver** and verify permissions
2. **Create a caretaker** using the API
3. **Set permissions** for the caretaker
4. **Login as caretaker** and verify limited access
5. **Test permission checks** on all protected endpoints

### API Testing with curl
```bash
# Create caretaker
curl -X POST http://localhost:8080/api/user-management/caretakers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Set permissions
curl -X PUT http://localhost:8080/api/user-management/caretakers/{id}/permissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"permissions": ["VIEW_REMINDERS"]}'
```

## Troubleshooting

### Common Issues

#### 1. Permission Denied Errors
- **Cause**: User doesn't have required permission
- **Solution**: Check user permissions in database or via API

#### 2. Caregiver-Caretaker Relationship Issues
- **Cause**: Assignment not created properly
- **Solution**: Verify `user_assignments` table has correct entries

#### 3. JWT Token Issues
- **Cause**: Invalid or expired token
- **Solution**: Re-login to get fresh token

### Database Queries for Debugging
```sql
-- Check user permissions
SELECT u.display_name, up.permission_name, up.is_enabled 
FROM app_user u 
JOIN user_permissions up ON u.id = up.user_id 
WHERE u.email = 'user@example.com';

-- Check caregiver-caretaker assignments
SELECT c.display_name as caregiver, t.display_name as caretaker
FROM user_assignments ua
JOIN app_user c ON ua.caregiver_id = c.id
JOIN app_user t ON ua.caretaker_id = t.id;
```

## Future Enhancements

### Planned Features
1. **Email invitations** for new users
2. **Permission templates** for common role types
3. **Audit logging** for permission changes
4. **Bulk permission management**
5. **Permission inheritance** from user groups

### Mobile App Considerations
- **QR code login** for limited-capability users
- **PIN-based authentication**
- **Offline permission caching**

## Files Modified/Created

### New Files
- `backend/src/main/java/com/attendo/mos/constants/PermissionConstants.java`
- `backend/src/main/java/com/attendo/mos/entity/UserPermission.java`
- `backend/src/main/java/com/attendo/mos/entity/UserAssignment.java`
- `backend/src/main/java/com/attendo/mos/repository/UserPermissionRepository.java`
- `backend/src/main/java/com/attendo/mos/repository/UserAssignmentRepository.java`
- `backend/src/main/java/com/attendo/mos/service/UserPermissionService.java`
- `backend/src/main/java/com/attendo/mos/service/UserManagementService.java`
- `backend/src/main/java/com/attendo/mos/controller/UserManagementController.java`
- `backend/src/main/resources/db/migration/V9__add_user_permissions_and_assignments.sql`

### Modified Files
- `backend/src/main/java/com/attendo/mos/controller/ReminderController.java`
- `backend/src/main/java/com/attendo/mos/controller/MealRequirementController.java`

## Support

For questions or issues with the permission system:
1. Check this guide first
2. Review the API documentation
3. Check database state using the debugging queries
4. Contact the development team

---

*Last updated: October 2024*
