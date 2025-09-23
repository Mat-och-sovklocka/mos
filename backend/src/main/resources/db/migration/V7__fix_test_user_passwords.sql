-- V7__fix_test_user_passwords.sql
-- Update existing test users with correct BCrypt password hash
-- Password: "password123"

UPDATE app_user 
SET password_hash = '$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu'
WHERE email IN (
    'admin@mos.test',
    'caregiver1@mos.test', 
    'caregiver2@mos.test',
    'resident1@mos.test',
    'resident2@mos.test',
    'resident3@mos.test',
    'inactive@mos.test'
);
