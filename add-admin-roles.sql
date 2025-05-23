-- Add is_admin column to usernames table
ALTER TABLE usernames 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update the first user (you) to be an admin
-- Replace 'your-email@example.com' with your actual email
UPDATE usernames 
SET is_admin = TRUE 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'andy@bhfe.com'
  LIMIT 1
);

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM usernames 
    WHERE user_id = user_uuid 
    AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to make a user an admin (only admins can call this)
CREATE OR REPLACE FUNCTION make_user_admin(target_user_id UUID, requesting_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF NOT is_user_admin(requesting_user_id) THEN
    RAISE EXCEPTION 'Only administrators can promote users';
  END IF;
  
  -- Update the target user to be an admin
  UPDATE usernames 
  SET is_admin = TRUE 
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to remove admin status (only admins can call this)
CREATE OR REPLACE FUNCTION remove_user_admin(target_user_id UUID, requesting_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF NOT is_user_admin(requesting_user_id) THEN
    RAISE EXCEPTION 'Only administrators can demote users';
  END IF;
  
  -- Prevent removing the last admin
  IF (SELECT COUNT(*) FROM usernames WHERE is_admin = TRUE) <= 1 THEN
    RAISE EXCEPTION 'Cannot remove the last administrator';
  END IF;
  
  -- Update the target user to not be an admin
  UPDATE usernames 
  SET is_admin = FALSE 
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 