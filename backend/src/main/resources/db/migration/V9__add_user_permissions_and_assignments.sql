-- Create user_permissions table
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    permission_name VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    granted_by UUID REFERENCES app_user(id),
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, permission_name)
);

-- Create user_assignments table (caregiver-caretaker relationships)
CREATE TABLE user_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    caretaker_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(caregiver_id, caretaker_id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission_name ON user_permissions(permission_name);
CREATE INDEX idx_user_assignments_caregiver_id ON user_assignments(caregiver_id);
CREATE INDEX idx_user_assignments_caretaker_id ON user_assignments(caretaker_id);

-- Insert default permissions for existing users
-- Admin users get all permissions
INSERT INTO user_permissions (user_id, permission_name, is_enabled, granted_by)
SELECT 
    u.id,
    p.permission_name,
    true,
    u.id
FROM app_user u
CROSS JOIN (
    VALUES 
        ('CREATE_REMINDERS'),
        ('VIEW_REMINDERS'),
        ('MEAL_REQUIREMENTS'),
        ('MEAL_SUGGESTIONS'),
        ('STATISTICS')
) AS p(permission_name)
WHERE u.user_type = 'ADMIN';

-- Caregiver users get basic permissions
INSERT INTO user_permissions (user_id, permission_name, is_enabled, granted_by)
SELECT 
    u.id,
    p.permission_name,
    true,
    u.id
FROM app_user u
CROSS JOIN (
    VALUES 
        ('CREATE_REMINDERS'),
        ('VIEW_REMINDERS'),
        ('MEAL_REQUIREMENTS')
) AS p(permission_name)
WHERE u.user_type = 'CAREGIVER';

-- Resident users get view permissions only
INSERT INTO user_permissions (user_id, permission_name, is_enabled, granted_by)
SELECT 
    u.id,
    'VIEW_REMINDERS',
    true,
    u.id
FROM app_user u
WHERE u.user_type = 'RESIDENT';
