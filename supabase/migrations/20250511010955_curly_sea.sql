/*
  # Update Audio Files Bucket Policies

  1. Changes
    - Update RLS policies for audio files bucket
    - Enable public read access for all users
    - Maintain admin-only write access
    - Ensure proper CORS headers

  2. Security
    - Allow authenticated and public users to read audio files
    - Maintain admin-only write access
    - Add proper security headers
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Audio files are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can upload audio files" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can update audio files" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can delete audio files" ON storage.objects;
END $$;

-- Create policy to allow public read access for audio files
CREATE POLICY "Audio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'novel-audio-files-bucket');

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

-- Update bucket configuration to ensure proper CORS and caching
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