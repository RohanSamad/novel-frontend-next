/*
  # Add Multiple Genres Support

  1. Changes
    - Create genres table for available genres
    - Create novel_genres junction table
    - Add indexes and constraints
    - Update RLS policies

  2. Security
    - Enable RLS on new tables
    - Set up appropriate access policies
*/

-- Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create novel_genres junction table
CREATE TABLE IF NOT EXISTS novel_genres (
  novel_id uuid REFERENCES novels(id) ON DELETE CASCADE,
  genre_id uuid REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (novel_id, genre_id)
);

-- Enable RLS
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE novel_genres ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Genres are viewable by everyone"
  ON genres FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify genres"
  ON genres FOR ALL
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

CREATE POLICY "Novel genres are viewable by everyone"
  ON novel_genres FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify novel genres"
  ON novel_genres FOR ALL
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

-- Create indexes
CREATE INDEX IF NOT EXISTS novel_genres_novel_id_idx ON novel_genres(novel_id);
CREATE INDEX IF NOT EXISTS novel_genres_genre_id_idx ON novel_genres(genre_id);
CREATE INDEX IF NOT EXISTS genres_name_idx ON genres(name);
CREATE INDEX IF NOT EXISTS genres_slug_idx ON genres(slug);

-- Insert default genres
INSERT INTO genres (name, slug, description) VALUES
  ('Action', 'action', 'Fast-paced novels filled with excitement and adventure'),
  ('Romance', 'romance', 'Stories focusing on romantic relationships'),
  ('Fantasy', 'fantasy', 'Tales of magic, mythical creatures, and epic adventures'),
  ('Science Fiction', 'sci-fi', 'Stories exploring futuristic concepts and technology'),
  ('Mystery', 'mystery', 'Intriguing novels focused on solving crimes or puzzles'),
  ('Horror', 'horror', 'Scary stories designed to thrill and frighten'),
  ('Historical Fiction', 'historical', 'Stories set in the past with historical accuracy'),
  ('Comedy', 'comedy', 'Humorous tales meant to entertain and amuse'),
  ('Drama', 'drama', 'Character-driven stories with emotional depth'),
  ('Thriller', 'thriller', 'Suspenseful novels that keep readers on edge'),
  ('Adventure', 'adventure', 'Stories of exciting journeys and exploration'),
  ('Contemporary', 'contemporary', 'Modern-day stories reflecting current times'),
  ('Urban Fantasy', 'urban-fantasy', 'Fantasy stories set in modern urban settings'),
  ('Young Adult', 'young-adult', 'Stories targeting teenage and young adult readers'),
  ('Literary Fiction', 'literary', 'Character-focused stories with artistic merit')
ON CONFLICT (slug) DO NOTHING;

-- Migrate existing genre data
INSERT INTO novel_genres (novel_id, genre_id)
SELECT 
  novels.id as novel_id,
  genres.id as genre_id
FROM novels
JOIN genres ON novels.genre = genres.slug
ON CONFLICT DO NOTHING;