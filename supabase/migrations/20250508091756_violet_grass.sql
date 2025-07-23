-- Drop existing policies to ensure clean state
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Novel covers are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can upload novel covers" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can update novel covers" ON storage.objects;
  DROP POLICY IF EXISTS "Only admins can delete novel covers" ON storage.objects;
END $$;

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Novel covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'novel-covers');

-- Create policy to allow admin insert access
CREATE POLICY "Only admins can upload novel covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'novel-covers' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy to allow admin update access
CREATE POLICY "Only admins can update novel covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'novel-covers' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'novel-covers' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policy to allow admin delete access
CREATE POLICY "Only admins can delete novel covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'novel-covers' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);