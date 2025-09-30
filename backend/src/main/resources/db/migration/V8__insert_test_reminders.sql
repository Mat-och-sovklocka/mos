-- V8__insert_test_reminders.sql
-- Insert test reminders for development and testing
-- Tied to existing test users from V6

-- Test reminders for resident1@mos.test (Maria Svensson)
INSERT INTO reminder (id, user_id, time_at, category, note, type, recurrence, created_at) VALUES
-- Once reminders
('a1e2f3d4-1111-4a4a-9b9b-000000000001', '550e8400-e29b-41d4-a716-446655440004', '2025-09-17T12:00:00+02:00', 'MEAL', 'Lunch med Anna, Karina och Johan', 'once', null, '2025-09-10T08:30:00+02:00'),
('b2e3f4a5-2222-4b4b-9c9c-000000000002', '550e8400-e29b-41d4-a716-446655440004', '2025-09-18T09:30:00+02:00', 'MEETING', null, 'once', null, '2025-09-10T08:35:00+02:00'),

-- Recurring reminders
('c3f4a5b6-3333-4c4c-9d9d-000000000003', '550e8400-e29b-41d4-a716-446655440004', null, 'MEAL', 'Frukost varje dag', 'recurring', '{"days": ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"], "times": ["08:00"]}', '2025-09-10T09:00:00+02:00'),
('d4a5b6c7-4444-4d4d-9e9e-000000000004', '550e8400-e29b-41d4-a716-446655440004', null, 'MEDICATION', null, 'recurring', '{"days": ["Måndag", "Onsdag"], "times": ["07:00", "19:00"]}', '2025-09-10T09:05:00+02:00');