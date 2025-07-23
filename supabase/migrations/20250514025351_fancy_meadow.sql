/*
  # Add Publishing Year to Novels

  1. Changes
    - Add publishing_year column to novels table
    - Update existing novels table structure
    - Add constraint for valid year values
*/

-- Add publishing_year column
ALTER TABLE novels
ADD COLUMN publishing_year integer;

-- Add constraint for valid years
ALTER TABLE novels
ADD CONSTRAINT novels_publishing_year_check 
CHECK (publishing_year >= 1800 AND publishing_year <= extract(year from now()) + 1);