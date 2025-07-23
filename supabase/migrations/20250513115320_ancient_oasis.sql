/*
  # Create Novel Chapter Audio Bucket

  1. Changes
    - Create new bucket for chapter audio files
    - Set up RLS policies
    - Configure file size and type limits

  2. Security
    - Enable public read access for all users
    - Restrict write operations to admin users only
*/

-- Create the storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create the bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('novel_chapter_audio_bucket', 'novel_chapter_audio_bucket', true)
  ON CONFLICT (id) DO NOTHING;

  -- Set bucket configuration
  UPDATE storage.buckets
  SET file_size_limit = 52428800, -- 50MB limit
      allowed_mime_types = ARRAY[
        'audio/mpeg',
        'audio/wav',
        'audio/mp4',
        'audio/ogg'
      ]
  WHERE id = 'novel_chapter_audio_bucket';
END $$;

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Audio files are accessible by everyone" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can upload audio files" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can update audio files" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can delete audio files" ON storage.objects;
END $$;

-- Create policy to allow public read access for all users
CREATE POLICY "Audio files are accessible by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'novel_chapter_audio_bucket');

-- Create policy to allow admin insert access
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

-- Create policy to allow admin update access
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

-- Create policy to allow admin delete access
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