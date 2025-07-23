/*
  # Add Author Pages Support

  1. Changes
    - Create authors table
    - Add author_id to novels table
    - Create indexes and constraints
    - Update RLS policies

  2. Security
    - Enable RLS on new tables
    - Set up appropriate access policies
*/

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add author_id to novels table
ALTER TABLE novels
ADD COLUMN author_id uuid REFERENCES authors(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS authors_name_idx ON authors(name);
CREATE INDEX IF NOT EXISTS novels_author_id_idx ON novels(author_id);

-- Enable RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authors are viewable by everyone"
  ON authors FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify authors"
  ON authors FOR ALL
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

-- Create trigger for updated_at
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing author data
INSERT INTO authors (name)
SELECT DISTINCT author FROM novels
ON CONFLICT (name) DO NOTHING;

-- Update novels with author_id
UPDATE novels
SET author_id = authors.id
FROM authors
WHERE novels.author = authors.name;

-- Create text search index
CREATE INDEX IF NOT EXISTS authors_name_trgm_idx ON authors USING gin (name gin_trgm_ops);