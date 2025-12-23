-- 1. Ensure financial_records has measurement_id (UUID)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_records' AND column_name = 'measurement_id') THEN
        ALTER TABLE financial_records ADD COLUMN measurement_id UUID;
    END IF;
END $$;

-- 2. Drop existing constraint if exists to ensure clean state
ALTER TABLE financial_records DROP CONSTRAINT IF EXISTS fk_financial_measurement;

-- 3. Add Foreign Key with ON DELETE CASCADE
ALTER TABLE financial_records
ADD CONSTRAINT fk_financial_measurement
FOREIGN KEY (measurement_id)
REFERENCES project_measurements(id)
ON DELETE CASCADE;

-- 4. Verify/Recreate Trigger for Revenue Creation (Optional but good practice to ensure integrity logic is here or in App)
-- Note: The user logic is currently in the Frontend (React). We will stick to the frontend logic for creation as requested.
-- This SQL only handles the "Death" of the record (Cascading Delete).
