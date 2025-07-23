-- Drop existing materialized view and related objects
DROP MATERIALIZED VIEW IF EXISTS novel_stats CASCADE;
DROP FUNCTION IF EXISTS update_novel_stats() CASCADE;

-- Drop existing triggers if they exist
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_novel_stats_on_rating ON novel_ratings;
  DROP TRIGGER IF EXISTS refresh_novel_stats_on_chapter ON chapters;
  DROP TRIGGER IF EXISTS refresh_novel_stats_on_progress ON user_progress;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create materialized view for novel statistics
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

-- Create unique index on id for concurrent refresh
CREATE UNIQUE INDEX novel_stats_unique_idx ON novel_stats(id);

-- Create function to update novel stats without concurrent refresh
CREATE OR REPLACE FUNCTION update_novel_stats()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW novel_stats;
  RETURN NULL;
END;
$$;

-- Create triggers to refresh novel stats
CREATE TRIGGER update_novel_stats_on_rating
  AFTER INSERT OR DELETE OR UPDATE ON novel_ratings
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_novel_stats();

CREATE TRIGGER refresh_novel_stats_on_chapter
  AFTER INSERT OR DELETE OR UPDATE ON chapters
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_novel_stats();

CREATE TRIGGER refresh_novel_stats_on_progress
  AFTER INSERT OR DELETE OR UPDATE ON user_progress
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_novel_stats();

-- Grant access to authenticated users
GRANT SELECT ON novel_stats TO authenticated;