/*
  # Sync Database Schema with Website

  1. Changes
    - Add indexes for better query performance
    - Add triggers for updated_at timestamps
    - Add constraints for data integrity
    - Update RLS policies for better security

  2. Security
    - Maintain existing RLS policies
    - Add additional checks for data integrity
*/

-- Add updated_at trigger for novels table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_novels_updated_at
  BEFORE UPDATE ON novels
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS novels_title_idx ON novels(title);
CREATE INDEX IF NOT EXISTS novels_author_idx ON novels(author);
CREATE INDEX IF NOT EXISTS novels_genre_idx ON novels(genre);
CREATE INDEX IF NOT EXISTS novels_status_idx ON novels(status);
CREATE INDEX IF NOT EXISTS chapters_title_idx ON chapters(title);
CREATE INDEX IF NOT EXISTS chapters_created_at_idx ON chapters(created_at);

-- Add check constraints for data validation
ALTER TABLE novels
ADD CONSTRAINT novels_title_length_check 
CHECK (length(title) >= 1 AND length(title) <= 255);

ALTER TABLE novels
ADD CONSTRAINT novels_synopsis_length_check 
CHECK (length(synopsis) >= 10);

ALTER TABLE chapters
ADD CONSTRAINT chapters_title_length_check 
CHECK (length(title) >= 1 AND length(title) <= 255);

ALTER TABLE chapters
ADD CONSTRAINT chapters_content_text_length_check 
CHECK (length(content_text) >= 1);

ALTER TABLE chapters
ADD CONSTRAINT chapters_chapter_number_check 
CHECK (chapter_number > 0);

ALTER TABLE chapters
ADD CONSTRAINT chapters_order_index_check 
CHECK (order_index > 0);

-- Add foreign key indexes
CREATE INDEX IF NOT EXISTS user_progress_user_novel_idx ON user_progress(user_id, novel_id);
CREATE INDEX IF NOT EXISTS user_progress_user_chapter_idx ON user_progress(user_id, chapter_id);

-- Update RLS policies to be more specific
ALTER POLICY "Novels can be modified by admins" ON novels
RENAME TO "Admins have full access to novels";

ALTER POLICY "Chapters can be modified by admins" ON chapters
RENAME TO "Admins have full access to chapters";

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS chapters_novel_number_idx ON chapters(novel_id, chapter_number);
CREATE INDEX IF NOT EXISTS user_progress_composite_idx ON user_progress(user_id, novel_id, chapter_id);
CREATE INDEX IF NOT EXISTS featured_novels_date_idx ON featured_novels(start_date, end_date);

-- Add check constraint for featured novel dates
ALTER TABLE featured_novels
ADD CONSTRAINT featured_novels_date_check 
CHECK (start_date < end_date);

-- Add trigger for user_progress timestamp update
CREATE TRIGGER update_user_progress_timestamp
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();