-- 1. Check if the is_user_admin function exists
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname = 'is_user_admin';

-- 2. Find the user with email a.freed@outlook.com
SELECT 
  id as user_id, 
  email, 
  created_at 
FROM auth.users 
WHERE email = 'a.freed@outlook.com';

-- 3. Check if this user has a username entry
SELECT 
  u.*, 
  au.email 
FROM usernames u
LEFT JOIN auth.users au ON u.user_id = au.id
WHERE au.email = 'a.freed@outlook.com' OR u.user_id IN (
  SELECT id FROM auth.users WHERE email = 'a.freed@outlook.com'
);

-- 4. If no results above, check all usernames entries
SELECT 
  u.*, 
  au.email 
FROM usernames u
LEFT JOIN auth.users au ON u.user_id = au.id
ORDER BY u.is_admin DESC, u.username;

-- 5. Test the is_user_admin function directly with your user ID
-- Replace 'YOUR_USER_ID' with the actual ID from query #2
-- SELECT is_user_admin('YOUR_USER_ID'::uuid); 