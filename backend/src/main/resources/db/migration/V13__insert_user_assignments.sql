-- V13__insert_user_assignments.sql
-- Insert test user assignments into the correct table

-- Insert the caregiver-caretaker relationships (only if they don't exist)
INSERT INTO user_assignments (caregiver_id, caretaker_id, assigned_at) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, NOW()),
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, NOW()),
    ('550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid, NOW())
) AS v(caregiver_id, caretaker_id, assigned_at)
WHERE NOT EXISTS (
    SELECT 1 FROM user_assignments ua 
    WHERE ua.caregiver_id = v.caregiver_id 
    AND ua.caretaker_id = v.caretaker_id
);
