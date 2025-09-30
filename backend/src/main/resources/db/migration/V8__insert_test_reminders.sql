-- V8__insert_test_reminders.sql
-- Insert test reminders for development and testing
-- Tied to existing test users from V6

-- Test reminders for resident1@mos.test (Maria Svensson)
INSERT INTO reminder (id, user_id, time_at, category, note, type, recurrence, created_at) VALUES
-- Once reminders
('a1e2f3d4-1111-4a4a-9b9b-000000000001', '550e8400-e29b-41d4-a716-446655440004', '2025-09-17T12:00:00+02:00', 'MEAL', 'Lunch med Anna, Karina och Johan', 'once', null, '2025-09-10T08:30:00+02:00'),
('b2e3f4g5-2222-4b4b-9c9c-000000000002', '550e8400-e29b-41d4-a716-446655440004', '2025-09-18T09:30:00+02:00', 'MEETING', null, 'once', null, '2025-09-10T08:35:00+02:00'),

-- Recurring reminders
('g7j8k9l0-7777-4g4g-9b9b-000000000007', '550e8400-e29b-41d4-a716-446655440004', null, 'MEAL', 'Frukost varje dag', 'recurring', '{"days": ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"], "times": ["08:00"]}', '2025-09-10T09:00:00+02:00'),
('h8k9l0m1-8888-4h4h-9c9c-000000000008', '550e8400-e29b-41d4-a716-446655440004', null, 'MEDICATION', null, 'recurring', '{"days": ["Måndag", "Onsdag"], "times": ["07:00", "19:00"]}', '2025-09-10T09:05:00+02:00');
