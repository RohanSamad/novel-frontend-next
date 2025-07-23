/*
  # Update Novel Chapter Audio Bucket Policies

  1. Changes
    - Update RLS policies to allow all users to access audio files
    - Add specific policy for authenticated users
    - Maintain admin-only write access

  2. Security
    - Enable public and authenticated read access
    - Maintain admin-only write permissions
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Audio files are accessible by everyone" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can upload audio files" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can update audio files" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can delete audio files" ON storage.objects;
END $$;

-- Create policy for public read access
CREATE POLICY "Audio files are accessible by everyone"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'novel_chapter_audio_bucket'
);

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can access audio files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'novel_chapter_audio_bucket' AND
  auth.role() = 'authenticated'
);

-- Create policy for admin insert access
CREATE POLICY "Only admins can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'novel_chapter_audio_bucket' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy for admin update access
CREATE POLICY "Only admins can update audio files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'novel_chapter_audio_bucket' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'novel_chapter_audio_bucket' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy for admin delete access
CREATE POLICY "Only admins can delete audio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'novel_chapter_audio_bucket' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Update bucket configuration
UPDATE storage.buckets
SET public = true,
    file_size_limit = 52428800, -- 50MB limit
    allowed_mime_types = ARRAY[
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/ogg'
    ]
WHERE id = 'novel_chapter_audio_bucket';