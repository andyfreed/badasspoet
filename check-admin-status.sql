-- Check all users and their admin status
SELECT 
  u.username, 
  u.is_admin, 
  u.user_id,
  u.is_taken,
  au.email,
  au.created_at
FROM usernames u
LEFT JOIN auth.users au ON u.user_id = au.id
ORDER BY u.is_admin DESC, u.username;

-- Specifically check a.freed@outlook.com
SELECT 
  'Checking a.freed@outlook.com:' as info,
  u.username, 
  u.is_admin, 
  u.user_id,
  au.email
FROM usernames u
JOIN auth.users au ON u.user_id = au.id
WHERE au.email = 'a.freed@outlook.com';

-- Check if the is_admin column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'usernames' AND column_name = 'is_admin'; 