/*
  # Create Author Avatar Storage Bucket

  1. Changes
    - Create new bucket for author avatars
    - Set up RLS policies
    - Configure file size and type limits
*/

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('novel_author_names', 'novel_author_names', true)
ON CONFLICT (id) DO NOTHING;

-- Set bucket configuration
UPDATE storage.buckets
SET file_size_limit = 2097152, -- 2MB limit
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
WHERE id = 'novel_author_names';

-- Create policy to allow public read access
CREATE POLICY "Author avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'novel_author_names');

-- Create policy to allow admin insert access
CREATE POLICY "Only admins can upload author avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'novel_author_names' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy to allow admin update access
CREATE POLICY "Only admins can update author avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'novel_author_names' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'novel_author_names' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy to allow admin delete access
CREATE POLICY "Only admins can delete author avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'novel_author_names' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);