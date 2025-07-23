/*
  # Fix RLS policies for chapters table

  1. Changes
    - Drop existing RLS policies for chapters table
    - Create new policies with proper admin role checks
    - Use profiles table to verify admin status

  2. Security
    - Public read access for all chapters
    - Admin-only write access (INSERT, UPDATE, DELETE)
    - Verify admin role through profiles table
*/

-- Drop existing policies to ensure clean state
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Chapters are viewable by everyone" ON chapters;
  DROP POLICY IF EXISTS "Chapters can be modified by admins" ON chapters;
END $$;

-- Enable RLS on chapters table
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Chapters are viewable by everyone"
ON chapters FOR SELECT
USING (true);

-- Create policy for admin write access
CREATE POLICY "Chapters can be modified by admins"
ON chapters FOR ALL
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