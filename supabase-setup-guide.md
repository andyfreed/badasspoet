# Supabase Setup Guide

## Setting up the Usernames Table

To fix the error `Failed to load resource: the server responded with a status of 404 ()` when trying to fetch usernames, you need to execute the SQL script to create the usernames table in your Supabase project.

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (with URL https://txiaalbplrxmwznnoidt.supabase.co)
3. In the left sidebar, click on **SQL Editor**
4. Click **New Query**
5. Copy and paste the following SQL code:

```sql
-- Create usernames table to track username availability
CREATE TABLE IF NOT EXISTS usernames (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  is_taken BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert initial usernames (skip if they already exist)
INSERT INTO usernames (username, is_taken)
VALUES 
  ('Mcflow', FALSE),
  ('Diddy', FALSE),
  ('Jeffrey Epstein', FALSE),
  ('Jared Fogle', FALSE)
ON CONFLICT (username) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE usernames ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to all usernames" ON usernames;
DROP POLICY IF EXISTS "Allow authenticated users to update usernames" ON usernames;

-- Create policies for username access
CREATE POLICY "Allow anonymous read access to all usernames" 
  ON usernames FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to update usernames" 
  ON usernames FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to claim a username with fixed type handling
CREATE OR REPLACE FUNCTION claim_username(username_to_claim TEXT, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INT;
BEGIN
  UPDATE usernames 
  SET 
    is_taken = TRUE,
    user_id = user_uuid
  WHERE 
    username = username_to_claim 
    AND is_taken = FALSE;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

6. Click **Run** to execute the SQL code

## Disabling Email Verification in Supabase

To disable email verification in Supabase (which is required for our automatic login feature to work properly), you need to update the authentication settings in the dashboard:

1. Go to your Supabase dashboard
2. Click on **Authentication** in the left sidebar
3. Go to the **Settings** tab
4. Under **Email Auth**, find and disable "Enable email confirmations"
5. Save the settings

These dashboard settings are important because we don't have permission to modify the auth tables directly through SQL.

After making these changes and executing the SQL script, refresh your application, and the login/signup functionality should work without requiring email verification.

## Troubleshooting

### "Operator does not exist: boolean > integer" Error

If you get this error, it means there was a type mismatch in the `claim_username` function. The SQL above has the fixed version that handles the types correctly.

### "Duplicate key value violates unique constraint" Error

If you get this error, it means you're trying to insert usernames that already exist in the database. The updated SQL above includes `ON CONFLICT (username) DO NOTHING` which will skip duplicates instead of raising an error.

### "Policy already exists" Error

If you get an error about policies already existing, the updated SQL script includes `DROP POLICY IF EXISTS` statements to remove any existing policies before creating new ones.

### Permission Errors

If you receive errors like "must be owner of table users" or "relation auth.config does not exist", you don't have permission to modify those tables directly. Instead, use the Supabase dashboard to configure authentication settings as described in the "Disabling Email Verification in Supabase" section.

### Username grid not showing

Make sure you:
1. Created the table using the exact SQL above 
2. Have enabled RLS (Row Level Security)
3. Created the correct policies for access
4. Have refreshed your browser after running the SQL 