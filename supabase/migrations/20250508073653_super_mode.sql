/*
  # Initial Schema Setup for Novel Tavern

  1. New Tables
    - users (handled by Supabase Auth)
    - novels
      - id (uuid, primary key)
      - title (text)
      - author (text)
      - publisher (text)
      - cover_image_url (text)
      - synopsis (text)
      - status (enum)
      - genre (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - chapters
      - id (uuid, primary key)
      - novel_id (uuid, foreign key)
      - chapter_number (integer)
      - title (text)
      - audio_url (text)
      - content_text (text)
      - order_index (integer)
      - created_at (timestamptz)
    
    - user_progress
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - novel_id (uuid, foreign key)
      - chapter_id (uuid, foreign key)
      - progress_timestamp (timestamptz)
      - audio_position (float)
    
    - featured_novels
      - id (uuid, primary key)
      - novel_id (uuid, foreign key)
      - position (integer)
      - start_date (timestamptz)
      - end_date (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Set up access policies for each table
*/

-- Create custom types
CREATE TYPE novel_status AS ENUM ('completed', 'ongoing', 'hiatus');

-- Create novels table
CREATE TABLE IF NOT EXISTS novels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  publisher text NOT NULL,
  cover_image_url text NOT NULL,
  synopsis text NOT NULL,
  status novel_status NOT NULL DEFAULT 'ongoing',
  genre text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id uuid REFERENCES novels(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL,
  title text NOT NULL,
  audio_url text NOT NULL,
  content_text text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(novel_id, chapter_number)
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  novel_id uuid REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  progress_timestamp timestamptz DEFAULT now(),
  audio_position float NOT NULL DEFAULT 0,
  UNIQUE(user_id, novel_id, chapter_id)
);

-- Create featured_novels table
CREATE TABLE IF NOT EXISTS featured_novels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id uuid REFERENCES novels(id) ON DELETE CASCADE,
  position integer NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  UNIQUE(position)
);

-- Enable Row Level Security
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_novels ENABLE ROW LEVEL SECURITY;

-- Create policies for novels
CREATE POLICY "Novels are viewable by everyone" 
  ON novels FOR SELECT 
  USING (true);

CREATE POLICY "Novels can be modified by admins" 
  ON novels FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for chapters
CREATE POLICY "Chapters are viewable by everyone" 
  ON chapters FOR SELECT 
  USING (true);

CREATE POLICY "Chapters can be modified by admins" 
  ON chapters FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for user_progress
CREATE POLICY "Users can view their own progress" 
  ON user_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON user_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress" 
  ON user_progress FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
  ON user_progress FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for featured_novels
CREATE POLICY "Featured novels are viewable by everyone" 
  ON featured_novels FOR SELECT 
  USING (true);

CREATE POLICY "Featured novels can be modified by admins" 
  ON featured_novels FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chapters_novel_id_idx ON chapters(novel_id);
CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS user_progress_novel_id_idx ON user_progress(novel_id);
CREATE INDEX IF NOT EXISTS user_progress_chapter_id_idx ON user_progress(chapter_id);
CREATE INDEX IF NOT EXISTS featured_novels_novel_id_idx ON featured_novels(novel_id);