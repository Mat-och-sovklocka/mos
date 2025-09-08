-- Enable UUIDs via pgcrypto (safe to re-run)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
CREATE TABLE IF NOT EXISTS app_user (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  display_name  VARCHAR(255)      NOT NULL,
  password_hash VARCHAR(255)      NOT NULL,
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT now()
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminder (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  time_at    TIMESTAMPTZ NOT NULL,
  category   VARCHAR(40) NOT NULL,   -- MEDICATION | MEAL
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reminder_user_id ON reminder(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_time_at ON reminder(time_at);

-- Meal requirements
CREATE TABLE IF NOT EXISTS meal_requirement (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  type       VARCHAR(40) NOT NULL,   -- VEGETARIAN | VEGAN | ...
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mealreq_user_id ON meal_requirement(user_id);
