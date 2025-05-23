-- First, get the user ID for a.freed@outlook.com
WITH user_info AS (
  SELECT id FROM auth.users WHERE email = 'a.freed@outlook.com'
)
-- Insert a new username entry for this user
INSERT INTO usernames (username, is_taken, is_admin, user_id)
SELECT 
  'Admin User',  -- You can change this username to whatever you prefer
  true,          -- Mark as taken
  true,          -- Mark as admin
  id             -- User ID from auth.users
FROM user_info
WHERE EXISTS (SELECT 1 FROM user_info);

-- Verify the insertion
SELECT 
  u.*, 
  au.email 
FROM usernames u
JOIN auth.users au ON u.user_id = au.id
WHERE au.email = 'a.freed@outlook.com'; 