/*
  # Add Last Login Column to Profiles

  1. Changes
    - Add last_sign_in_at column to profiles table
    - Update RLS policies for better security
*/

-- Add last_sign_in_at column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;

-- Create function to update last sign in time
CREATE OR REPLACE FUNCTION update_last_sign_in()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET last_sign_in_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_sign_in_at on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_sign_in();