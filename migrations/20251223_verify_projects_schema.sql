-- Consolidated migration to add all potentially missing columns safely
-- This script uses IF NOT EXISTS to avoid errors if the column is already there

ALTER TABLE projects ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
