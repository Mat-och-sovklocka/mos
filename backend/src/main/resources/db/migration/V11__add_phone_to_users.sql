-- Add phone column to app_user table
ALTER TABLE app_user ADD COLUMN phone VARCHAR(20);

-- Add some sample phone numbers for existing test users
UPDATE app_user SET phone = '+46 70 123 4567' WHERE email = 'admin@mos.test';
UPDATE app_user SET phone = '+46 70 234 5678' WHERE email = 'caregiver@mos.test';
UPDATE app_user SET phone = '+46 70 345 6789' WHERE email = 'resident1@mos.test';
UPDATE app_user SET phone = '+46 70 456 7890' WHERE email = 'resident2@mos.test';
