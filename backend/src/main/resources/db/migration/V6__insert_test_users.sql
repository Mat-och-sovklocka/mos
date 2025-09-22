-- V6__insert_test_users.sql
-- Insert test users for development and testing

-- Test users with BCrypt hashed passwords
-- Password for all test users: "password123"

INSERT INTO app_user (id, email, display_name, password_hash, user_type, is_active, created_at) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440001', 'admin@mos.test', 'System Administrator', '$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu', 'ADMIN', true, NOW()),

-- Caregiver users
('550e8400-e29b-41d4-a716-446655440002', 'caregiver1@mos.test', 'Anna Andersson', '$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu', 'CAREGIVER', true, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'caregiver2@mos.test', 'Erik Eriksson', '$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu', 'CAREGIVER', true, NOW()),

-- Resident users
('550e8400-e29b-41d4-a716-446655440004', 'resident1@mos.test', 'Maria Svensson', '$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu', 'RESIDENT', true, NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'resident2@mos.test', 'Lars Larsson', '$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu', 'RESIDENT', true, NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'resident3@mos.test', 'Ingrid Johansson', '$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu', 'RESIDENT', true, NOW()),

-- Inactive user for testing
('550e8400-e29b-41d4-a716-446655440007', 'inactive@mos.test', 'Inactive User', '$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu', 'RESIDENT', false, NOW());

-- Create caregiver-resident assignments
INSERT INTO user_assignment (caregiver_id, resident_id, assigned_at) VALUES
-- Anna Andersson (caregiver1) assigned to Maria Svensson and Lars Larsson
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', NOW()),

-- Erik Eriksson (caregiver2) assigned to Ingrid Johansson
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', NOW());
