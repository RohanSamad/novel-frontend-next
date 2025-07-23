/*
  # Fix Featured Novels RLS Policies

  1. Changes
    - Drop existing RLS policies for featured_novels table
    - Create new policies with proper admin role checks
    - Use profiles table to verify admin status

  2. Security
    - Public read access for all featured novels
    - Admin-only write access (INSERT, UPDATE, DELETE)
    - Verify admin role through profiles table
*/

-- Drop existing policies to ensure clean state
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Featured novels are viewable by everyone" ON featured_novels;
  DROP POLICY IF EXISTS "Featured novels can be modified by admins" ON featured_novels;
END $$;

-- Enable RLS on featured_novels table
ALTER TABLE featured_novels ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Featured novels are viewable by everyone"
ON featured_novels FOR SELECT
USING (true);

-- Create policy for admin write access
CREATE POLICY "Featured novels can be modified by admins"
ON featured_novels FOR ALL
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