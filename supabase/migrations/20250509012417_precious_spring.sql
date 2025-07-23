/*
  # Create Novel Audio Files Storage Bucket

  1. Storage Setup
    - Create novel-audio-files-bucket
    - Set file size limit to 50MB
    - Allow only audio file types (MP3, WAV, M4A, OGG)

  2. Security
    - Enable public read access
    - Restrict write operations to admin users only
*/

-- Create the storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create the bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('novel-audio-files-bucket', 'novel-audio-files-bucket', true)
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
  WHERE id = 'novel-audio-files-bucket';
END $$;

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
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