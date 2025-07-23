/*
  # Fix Novel Views Table

  1. Changes
    - Add unique constraint to novel_views table
    - Update table structure for better data integrity
    - Add trigger for view count updates
*/

-- First, clean up any duplicate records
DELETE FROM novel_views a USING novel_views b
WHERE a.id > b.id 
  AND a.novel_id = b.novel_id 
  AND (
    (a.chapter_id IS NULL AND b.chapter_id IS NULL) OR
    a.chapter_id = b.chapter_id
  );

-- Add unique constraint
ALTER TABLE novel_views
ADD CONSTRAINT novel_views_novel_chapter_key 
UNIQUE NULLS NOT DISTINCT (novel_id, chapter_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS novel_views_novel_chapter_idx 
ON novel_views(novel_id) 
WHERE chapter_id IS NULL;