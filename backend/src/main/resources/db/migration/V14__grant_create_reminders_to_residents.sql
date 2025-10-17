-- V14__grant_create_reminders_to_residents.sql
-- Grant CREATE_REMINDERS permission to all resident users
-- This allows residents to manage their own reminders if their caregiver grants them permission

-- Grant CREATE_REMINDERS to all existing resident users
INSERT INTO user_permissions (id, user_id, permission_name, is_enabled, granted_by, granted_at) 
SELECT gen_random_uuid(), id, 'CREATE_REMINDERS', true, 
       (SELECT id FROM app_user WHERE user_type = 'ADMIN' LIMIT 1), NOW()
FROM app_user 
WHERE user_type = 'RESIDENT'
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Update the default permissions for new residents in the future
-- This will be handled by the UserManagementService.assignDefaultPermissions method
-- which already grants CREATE_REMINDERS to residents when they are created
