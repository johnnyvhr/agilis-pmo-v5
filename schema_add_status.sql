-- Add status column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'Ativo';

-- Update existing rows to have 'Ativo' if they are null
UPDATE profiles SET status = 'Ativo' WHERE status IS NULL;

-- Policy to allow updates to status (usually already covered by "Users can update own profile" OR admin policies)
-- Ensuring we have a policy for reading status (already covered by "Public profiles are viewable")
