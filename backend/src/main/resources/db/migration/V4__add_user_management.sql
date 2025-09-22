-- V4__add_user_management.sql
-- Add user management fields and relationships

-- Add user management fields to app_user table
ALTER TABLE app_user 
ADD COLUMN user_type VARCHAR(20) NOT NULL DEFAULT 'RESIDENT',
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN assigned_caregiver_id UUID REFERENCES app_user(id),
ADD COLUMN last_login_at TIMESTAMPTZ;

-- Create user assignments table for caregiver-resident relationships
CREATE TABLE user_assignment (
    caregiver_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (caregiver_id, resident_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_type ON app_user(user_type);
CREATE INDEX idx_user_active ON app_user(is_active);
CREATE INDEX idx_user_caregiver ON app_user(assigned_caregiver_id);
CREATE INDEX idx_user_assignment_caregiver ON user_assignment(caregiver_id);
CREATE INDEX idx_user_assignment_resident ON user_assignment(resident_id);

-- Add constraint to prevent self-assignment
ALTER TABLE user_assignment 
ADD CONSTRAINT check_no_self_assignment 
CHECK (caregiver_id != resident_id);
