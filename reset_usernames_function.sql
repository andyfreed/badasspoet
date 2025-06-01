-- Create or replace the reset_all_usernames function
CREATE OR REPLACE FUNCTION reset_all_usernames()
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE usernames 
  SET 
    is_taken = FALSE,
    user_id = NULL
  WHERE 
    is_taken = TRUE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 