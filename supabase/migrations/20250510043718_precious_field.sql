/*
  # Update Novel Statistics View and Indexes

  1. Changes
    - Drop and recreate materialized view for novel statistics
    - Add performance optimizations and indexes
    - Update column types and cache settings
    - Add text search capabilities

  2. Performance
    - Add composite and partial indexes
    - Enable trigram search
    - Configure autovacuum settings
*/

-- Drop existing materialized view and related objects
DROP MATERIALIZED VIEW IF EXISTS novel_stats CASCADE;
DROP FUNCTION IF EXISTS refresh_novel_stats() CASCADE;

-- Create materialized view for novel statistics
CREATE MATERIALIZED VIEW novel_stats AS
SELECT 
  n.id,
  n.title,
  COUNT(DISTINCT c.id) as chapter_count,
  COUNT(DISTINCT up.user_id) as reader_count,
  MAX(c.created_at) as last_updated
FROM novels n
LEFT JOIN chapters c ON c.novel_id = n.id
LEFT JOIN user_progress up ON up.novel_id = n.id
GROUP BY n.id, n.title;

CREATE UNIQUE INDEX novel_stats_id_idx ON novel_stats(id);

-- Grant access to authenticated users
GRANT SELECT ON novel_stats TO authenticated;

-- Create function to refresh novel stats with elevated privileges
CREATE OR REPLACE FUNCTION refresh_novel_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY novel_stats;
  RETURN NULL;
END;
$$;

-- Create triggers to refresh novel stats
CREATE TRIGGER refresh_novel_stats_on_chapter
AFTER INSERT OR UPDATE OR DELETE ON chapters
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_novel_stats();

CREATE TRIGGER refresh_novel_stats_on_progress
AFTER INSERT OR UPDATE OR DELETE ON user_progress
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_novel_stats();

-- Add partial indexes for common queries
CREATE INDEX IF NOT EXISTS novels_ongoing_idx ON novels(created_at)
WHERE status = 'ongoing';

CREATE INDEX IF NOT EXISTS novels_completed_idx ON novels(created_at)
WHERE status = 'completed';

-- Add composite indexes for common joins
CREATE INDEX IF NOT EXISTS chapters_novel_order_idx ON chapters(novel_id, order_index, chapter_number);
CREATE INDEX IF NOT EXISTS progress_user_novel_time_idx ON user_progress(user_id, novel_id, progress_timestamp);

-- Add time-based index on user_progress
CREATE INDEX IF NOT EXISTS user_progress_time_idx ON user_progress(progress_timestamp);

-- Optimize column types
ALTER TABLE chapters
ALTER COLUMN content_text TYPE text USING content_text::text,
ALTER COLUMN audio_url TYPE varchar(255) USING audio_url::varchar(255);

ALTER TABLE novels
ALTER COLUMN cover_image_url TYPE varchar(255) USING cover_image_url::varchar(255);

-- Add cache settings for frequently accessed data
ALTER MATERIALIZED VIEW novel_stats SET (
  autovacuum_enabled = true,
  autovacuum_vacuum_threshold = 50,
  autovacuum_analyze_threshold = 50
);

-- Create function to clean up old progress records
CREATE OR REPLACE FUNCTION cleanup_old_progress()
RETURNS void AS $$
BEGIN
  DELETE FROM user_progress
  WHERE progress_timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Add text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS novels_title_trgm_idx ON novels USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS novels_author_trgm_idx ON novels USING gin (author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS novels_synopsis_trgm_idx ON novels USING gin (synopsis gin_trgm_ops);

-- Analyze tables for query optimization
ANALYZE novels;
ANALYZE chapters;
ANALYZE user_progress;
ANALYZE novel_stats;