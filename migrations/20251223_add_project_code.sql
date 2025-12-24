
-- Add code column to projects table
ALTER TABLE projects
ADD COLUMN code TEXT UNIQUE;
