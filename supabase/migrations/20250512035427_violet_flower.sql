/*
  # Add New Genre Types

  1. Changes
    - Add new genre types to the genres table
    - Update existing genre descriptions
    - Add new categories for novels
*/

-- Insert new genres
INSERT INTO genres (name, slug, description) VALUES
  ('Game', 'game', 'Stories based on or involving video games and gaming worlds'),
  ('System', 'system', 'Stories featuring system-based progression and mechanics'),
  ('Reincarnation', 'reincarnation', 'Stories about characters being reborn or transported to new worlds'),
  ('Ecchi', 'ecchi', 'Stories with mild adult themes and fanservice'),
  ('Hentai', 'hentai', 'Adult-oriented content with explicit themes'),
  ('Dark', 'dark', 'Stories with darker themes and mature content'),
  ('Gore', 'gore', 'Stories containing graphic violence and intense content'),
  ('Other', 'other', 'Stories that don''t fit into other specific categories')
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;