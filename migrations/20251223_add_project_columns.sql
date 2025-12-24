-- Add code and client columns to projects table safely
ALTER TABLE projects ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client TEXT;
