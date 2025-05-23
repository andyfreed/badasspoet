-- Make a.freed@outlook.com an admin
UPDATE usernames 
SET is_admin = TRUE 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'a.freed@outlook.com'
  LIMIT 1
);

-- Verify the update
SELECT 
  u.username, 
  u.is_admin, 
  u.user_id,
  au.email
FROM usernames u
JOIN auth.users au ON u.user_id = au.id
WHERE au.email = 'a.freed@outlook.com'; 