/*
  # Clear All Novel Data
  
  1. Changes
    - Remove all featured novels
    - Remove all user progress records
    - Remove all chapters
    - Remove all novels
    - Clean up storage objects
    
  2. Notes
    - Deletions are ordered to respect foreign key constraints
    - Storage objects are cleaned up last
*/

-- Clear featured novels first (references novels)
DELETE FROM featured_novels;

-- Clear user progress (references both novels and chapters)
DELETE FROM user_progress;

-- Clear chapters (references novels)
DELETE FROM chapters;

-- Finally clear novels
DELETE FROM novels;

-- Clean storage objects
DELETE FROM storage.objects
WHERE bucket_id = 'novel-covers';