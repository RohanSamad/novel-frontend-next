/*
  # Add Cultivation Genre Type

  1. Changes
    - Add cultivation genre type to the genres table
    - Update genre descriptions
*/

-- Insert new genre
INSERT INTO genres (name, slug, description) VALUES
  ('Cultivation', 'cultivation', 'Stories about martial artists and spiritual cultivation')
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;