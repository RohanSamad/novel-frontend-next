/*
  # Create New Novel Covers Storage Bucket

  1. Changes
    - Drop existing policies for old bucket
    - Create new bucket with updated configuration
    - Set up RLS policies for the new bucket

  2. Security
    - Enable public read access
    - Restrict write operations to admin users only
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Novel covers are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can upload novel covers" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can update novel covers" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can delete novel covers" ON storage.objects;
END $$;

-- Delete objects from the old bucket
DELETE FROM storage.objects WHERE bucket_id = 'novel-covers';

-- Delete the old bucket
DELETE FROM storage.buckets WHERE id = 'novel-covers';

-- Create the new bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('novel-covers-v2', 'novel-covers-v2', true)
ON CONFLICT (id) DO NOTHING;

-- Set bucket configuration
UPDATE storage.buckets
SET file_size_limit = 2097152, -- 2MB limit
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
WHERE id = 'novel-covers-v2';

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Novel covers v2 are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'novel-covers-v2');

-- Create policy to allow admin insert access
CREATE POLICY "Only admins can upload novel covers v2"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'novel-covers-v2' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy to allow admin update access
CREATE POLICY "Only admins can update novel covers v2"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'novel-covers-v2' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'novel-covers-v2' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy to allow admin delete access
CREATE POLICY "Only admins can delete novel covers v2"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'novel-covers-v2' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);