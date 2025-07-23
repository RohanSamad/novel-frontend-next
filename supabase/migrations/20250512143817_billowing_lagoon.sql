/*
  # Add New Genre Types

  1. Changes
    - Add new genre types to the genres table
    - Update existing genre descriptions
    - Add new categories for novels
*/

-- Insert new genres
INSERT INTO genres (name, slug, description) VALUES
  ('Slice of Life', 'slice-of-life', 'Stories focusing on everyday life experiences and personal growth'),
  ('Isekai', 'isekai', 'Stories about characters transported to another world'),
  ('Fanfiction', 'fanfiction', 'Stories based on existing works, characters, or universes'),
  ('Anime / Comic', 'anime-comic', 'Stories adapted from or inspired by anime and comics'),
  ('Tragedy', 'tragedy', 'Stories with dramatic and often sorrowful themes'),
  ('War', 'war', 'Stories centered around military conflicts and their impact')
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;