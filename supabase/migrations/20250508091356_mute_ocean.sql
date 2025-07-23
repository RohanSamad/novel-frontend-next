/*
  # Create Novel Covers Storage Bucket

  1. Storage Setup
    - Create novel-covers bucket
    - Set file size limit to 2MB
    - Allow only image file types (PNG, JPEG, WebP)

  2. Security
    - Enable public read access
    - Restrict write operations to admin users only
*/

-- Create the storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create the auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create the bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('novel-covers', 'novel-covers', true)
  ON CONFLICT (id) DO NOTHING;

  -- Set bucket configuration
  UPDATE storage.buckets
  SET file_size_limit = 2097152, -- 2MB limit
      allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
  WHERE id = 'novel-covers';
END $$;

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Novel covers are publicly accessible'
  ) THEN
    CREATE POLICY "Novel covers are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'novel-covers');
  END IF;
END $$;

-- Create policy to allow admin insert access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Only admins can upload novel covers'
  ) THEN
    CREATE POLICY "Only admins can upload novel covers"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'novel-covers' AND
        (auth.jwt() ->> 'role' = 'admin')
      );
  END IF;
END $$;

-- Create policy to allow admin update access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Only admins can update novel covers'
  ) THEN
    CREATE POLICY "Only admins can update novel covers"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'novel-covers' AND
        (auth.jwt() ->> 'role' = 'admin')
      )
      WITH CHECK (
        bucket_id = 'novel-covers' AND
        (auth.jwt() ->> 'role' = 'admin')
      );
  END IF;
END $$;

-- Create policy to allow admin delete access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Only admins can delete novel covers'
  ) THEN
    CREATE POLICY "Only admins can delete novel covers"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'novel-covers' AND
        (auth.jwt() ->> 'role' = 'admin')
      );
  END IF;
END $$;