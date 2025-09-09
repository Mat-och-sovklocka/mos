ALTER TABLE reminder
ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'once',
    ADD COLUMN recurrence JSONB;
-- optional: index to query by type
CREATE INDEX IF NOT EXISTS idx_reminder_type ON reminder(type);