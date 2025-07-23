/*
  # Fix RLS policies for novels table

  1. Changes
    - Drop existing RLS policies for novels table
    - Create new policies with proper admin role checks
    - Use profiles table to verify admin status

  2. Security
    - Public read access for all novels
    - Admin-only write access (INSERT, UPDATE, DELETE)
    - Verify admin role through profiles table
*/

-- Drop existing policies to ensure clean state
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Novels are viewable by everyone" ON novels;
  DROP POLICY IF EXISTS "Novels can be modified by admins" ON novels;
END $$;

-- Enable RLS on novels table
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Novels are viewable by everyone"
ON novels FOR SELECT
USING (true);

-- Create policy for admin write access
CREATE POLICY "Novels can be modified by admins"
ON novels FOR ALL
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);