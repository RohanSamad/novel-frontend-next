/*
  # Remove Last Sign In Function and Trigger

  1. Changes
    - Drop the trigger on auth.users
    - Drop the update_last_sign_in function
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS update_last_sign_in();