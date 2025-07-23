/*
  # Add Novel Ratings Support

  1. New Tables
    - novel_ratings
      - id (uuid, primary key)
      - novel_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - rating (integer, 1-5)
      - created_at (timestamptz)
    
    - novel_views
      - id (uuid, primary key)
      - novel_id (uuid, foreign key)
      - chapter_id (uuid, foreign key, nullable)
      - view_count (integer)
      - last_updated (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Set up appropriate access policies
*/

-- Create novel_ratings table
CREATE TABLE IF NOT EXISTS novel_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id uuid REFERENCES novels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(novel_id, user_id)
);

-- Create novel_views table
CREATE TABLE IF NOT EXISTS novel_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id uuid REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  view_count integer DEFAULT 1,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE novel_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE novel_views ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS novel_ratings_novel_id_idx ON novel_ratings(novel_id);
CREATE INDEX IF NOT EXISTS novel_ratings_user_id_idx ON novel_ratings(user_id);
CREATE INDEX IF NOT EXISTS novel_views_novel_id_idx ON novel_views(novel_id);
CREATE INDEX IF NOT EXISTS novel_views_chapter_id_idx ON novel_views(chapter_id);

-- Create policies for novel_ratings
CREATE POLICY "Novel ratings are viewable by everyone"
  ON novel_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can rate novels"
  ON novel_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON novel_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON novel_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for novel_views
CREATE POLICY "Novel views are viewable by everyone"
  ON novel_views FOR SELECT
  USING (true);

CREATE POLICY "Anyone can increment view count"
  ON novel_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update view count"
  ON novel_views FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create function to update novel stats
CREATE OR REPLACE FUNCTION update_novel_stats()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY novel_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for novel_ratings
CREATE TRIGGER update_novel_stats_on_rating
  AFTER INSERT OR UPDATE OR DELETE ON novel_ratings
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_novel_stats();

-- Update novel_stats materialized view
DROP MATERIALIZED VIEW IF EXISTS novel_stats;

CREATE MATERIALIZED VIEW novel_stats AS
SELECT 
  n.id,
  n.title,
  COUNT(DISTINCT c.id) as chapter_count,
  COUNT(DISTINCT up.user_id) as reader_count,
  COALESCE(AVG(nr.rating), 0) as average_rating,
  COUNT(DISTINCT nr.id) as rating_count,
  COALESCE(SUM(nv.view_count), 0) as total_views,
  MAX(c.created_at) as last_updated
FROM novels n
LEFT JOIN chapters c ON c.novel_id = n.id
LEFT JOIN user_progress up ON up.novel_id = n.id
LEFT JOIN novel_ratings nr ON nr.novel_id = n.id
LEFT JOIN novel_views nv ON nv.novel_id = n.id
GROUP BY n.id, n.title;