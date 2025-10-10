-- Grant permissions to test users for development/testing
-- Using INSERT ... ON CONFLICT DO NOTHING to handle existing permissions

-- Admin user gets all permissions
INSERT INTO user_permissions (id, user_id, permission_name, is_enabled, granted_by, granted_at) VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'VIEW_REMINDERS', true, '550e8400-e29b-41d4-a716-446655440001', NOW()),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'CREATE_REMINDERS', true, '550e8400-e29b-41d4-a716-446655440001', NOW()),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'MEAL_REQUIREMENTS', true, '550e8400-e29b-41d4-a716-446655440001', NOW())
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Caregiver user gets permissions to manage reminders and meal requirements
INSERT INTO user_permissions (id, user_id, permission_name, is_enabled, granted_by, granted_at) VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'VIEW_REMINDERS', true, '550e8400-e29b-41d4-a716-446655440001', NOW()),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'CREATE_REMINDERS', true, '550e8400-e29b-41d4-a716-446655440001', NOW()),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'MEAL_REQUIREMENTS', true, '550e8400-e29b-41d4-a716-446655440001', NOW())
ON CONFLICT (user_id, permission_name) DO NOTHING;

-- Resident user gets basic permissions
INSERT INTO user_permissions (id, user_id, permission_name, is_enabled, granted_by, granted_at) VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'VIEW_REMINDERS', true, '550e8400-e29b-41d4-a716-446655440001', NOW())
ON CONFLICT (user_id, permission_name) DO NOTHING;
