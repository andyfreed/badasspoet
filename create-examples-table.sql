-- Drop the existing table if it exists
DROP TABLE IF EXISTS examples;

-- Create examples table
CREATE TABLE examples (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  title TEXT NOT NULL,
  content TEXT,
  is_published BOOLEAN DEFAULT FALSE
);

-- Insert sample data
INSERT INTO examples (title, content, is_published)
VALUES 
  ('First Example', 'This is the content of the first example', TRUE),
  ('Second Example', 'More example content here', TRUE),
  ('Draft Example', 'This is an unpublished draft', FALSE);

-- Enable RLS (Row Level Security)
ALTER TABLE examples ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous users to read published examples
CREATE POLICY "Allow anonymous read access to published examples" 
  ON examples FOR SELECT 
  USING (is_published = TRUE); 