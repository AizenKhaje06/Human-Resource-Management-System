-- Add employment_status column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20) DEFAULT 'regular' CHECK (employment_status IN ('regular', 'probationary', 'part-time'));

-- Create index for employment status
CREATE INDEX IF NOT EXISTS idx_profiles_employment_status ON profiles(employment_status);
