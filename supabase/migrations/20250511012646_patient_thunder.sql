/*
  # Update Audio Files Bucket Policies for Authenticated Users

  1. Changes
    - Add new RLS policies for audio files bucket
    - Allow authenticated users to access audio files
    - Maintain admin-only write access
    - Update bucket configuration

  2. Security
    - Enable access for authenticated users
    - Maintain admin-only write permissions
    - Keep public read access for unauthenticated users
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Audio files are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can upload audio files" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can update audio files" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can delete audio files" ON storage.objects;
END $$;

-- Create policy to allow public and authenticated read access for audio files
CREATE POLICY "Audio files are accessible by everyone"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'novel-audio-files-bucket' AND
  (
    auth.role() = 'authenticated' OR
    auth.role() = 'anon'
  )
);

-- Create policy to allow admin insert access
CREATE POLICY "Only admins can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'novel-audio-files-bucket' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy to allow admin update access
CREATE POLICY "Only admins can update audio files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'novel-audio-files-bucket' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'novel-audio-files-bucket' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy to allow admin delete access
CREATE POLICY "Only admins can delete audio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'novel-audio-files-bucket' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Update bucket configuration to ensure proper access and caching
UPDATE storage.buckets
SET public = true,
    file_size_limit = 52428800, -- 50MB limit
    allowed_mime_types = ARRAY[
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/ogg'
    ]
WHERE id = 'novel-audio-files-bucket';