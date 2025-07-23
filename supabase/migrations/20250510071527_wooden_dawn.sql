/*
  # Create User Profiles View

  1. Changes
    - Create a secure view for user profiles
    - Grant appropriate permissions
    - Secure access through underlying table RLS

  2. Security
    - Only admins can access user data
    - Public fields are properly filtered
    - Security enforced through profiles table RLS
*/

-- Create a secure view for user data that inherits RLS from the underlying tables
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  p.id,
  p.username,
  p.role,
  p.created_at,
  p.last_sign_in_at,
  u.email,
  u.confirmed_at as email_confirmed_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE EXISTS (
  SELECT 1 FROM profiles admin
  WHERE admin.id = auth.uid()
  AND admin.role = 'admin'
);

-- Grant access to authenticated users
GRANT SELECT ON user_profiles TO authenticated;

-- Create index to improve view performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Analyze the view for query optimization
ANALYZE user_profiles;