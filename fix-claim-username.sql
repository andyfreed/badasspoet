-- Drop existing function
DROP FUNCTION IF EXISTS claim_username(TEXT, UUID);

-- Create improved claim_username function that doesn't require foreign key
CREATE OR REPLACE FUNCTION claim_username(username_to_claim TEXT, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INT;
BEGIN
  -- First check if username is available
  IF EXISTS (SELECT 1 FROM usernames WHERE username = username_to_claim AND is_taken = TRUE) THEN
    RETURN FALSE; -- Username already taken
  END IF;
  
  -- Update the username without enforcing foreign key constraint
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

-- Also update the usernames table to make user_id nullable if it isn't already
ALTER TABLE usernames 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop the foreign key constraint temporarily
ALTER TABLE usernames
DROP CONSTRAINT IF EXISTS usernames_user_id_fkey; 