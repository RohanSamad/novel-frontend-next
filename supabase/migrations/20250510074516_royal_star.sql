/*
  # Add Adult Genre Types

  1. Changes
    - Add adult genre types to the genres table
    - Update genre descriptions
    - Add age restriction flag
*/

-- Insert new genres
INSERT INTO genres (name, slug, description) VALUES
  ('Harem', 'harem', 'Stories featuring multiple romantic interests'),
  ('Adult', 'adult', 'Mature content intended for adult audiences')
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;