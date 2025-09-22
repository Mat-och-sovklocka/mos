-- V5__remove_duplicate_relationships.sql
-- Remove the assigned_caregiver_id column from app_user table
-- since we're using UserAssignment entity for caregiver-resident relationships

-- Drop the foreign key constraint first
ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_assigned_caregiver_id_fkey;

-- Drop the index
DROP INDEX IF EXISTS idx_user_caregiver;

-- Remove the column
ALTER TABLE app_user DROP COLUMN IF EXISTS assigned_caregiver_id;
