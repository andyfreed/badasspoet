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