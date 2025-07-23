/*
  # Add More Genre Types

  1. Changes
    - Add more genre types to the genres table
    - Update existing genre descriptions
    - Add new indexes for improved performance

  2. Security
    - Maintain existing RLS policies
*/

-- Insert new genres
INSERT INTO genres (name, slug, description) VALUES
  ('Crime Fiction', 'crime', 'Detective stories and criminal investigations'),
  ('Paranormal', 'paranormal', 'Stories involving supernatural elements'),
  ('Dystopian', 'dystopian', 'Stories set in bleak future societies'),
  ('Military Fiction', 'military', 'Stories focused on military life and warfare'),
  ('Western', 'western', 'Stories set in the American frontier'),
  ('Magical Realism', 'magical-realism', 'Stories blending reality with magical elements'),
  ('Cyberpunk', 'cyberpunk', 'High-tech, low-life science fiction stories')
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Update existing genre descriptions
UPDATE genres
SET description = CASE slug
  WHEN 'action' THEN 'Action-packed stories with thrilling adventures'
  WHEN 'romance' THEN 'Stories focusing on romantic relationships and love'
  WHEN 'fantasy' THEN 'Tales of magic, mythical creatures, and epic quests'
  WHEN 'sci-fi' THEN 'Stories exploring futuristic technology and space'
  WHEN 'mystery' THEN 'Intriguing detective stories and suspenseful mysteries'
  WHEN 'horror' THEN 'Frightening tales designed to scare and thrill'
  WHEN 'historical' THEN 'Stories set in past historical periods'
  WHEN 'comedy' THEN 'Humorous stories meant to entertain and amuse'
  WHEN 'drama' THEN 'Character-driven stories with emotional depth'
  WHEN 'literary' THEN 'Sophisticated, character-focused literary works'
  WHEN 'contemporary' THEN 'Stories set in the modern world'
  WHEN 'urban-fantasy' THEN 'Fantasy stories in modern urban settings'
  WHEN 'young-adult' THEN 'Stories for teenage and young adult readers'
  ELSE description
END
WHERE slug IN (
  'action', 'romance', 'fantasy', 'sci-fi', 'mystery',
  'horror', 'historical', 'comedy', 'drama', 'literary',
  'contemporary', 'urban-fantasy', 'young-adult'
);

-- Add new indexes for improved performance
CREATE INDEX IF NOT EXISTS genres_name_trgm_idx ON genres USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS genres_description_trgm_idx ON genres USING gin (description gin_trgm_ops);