const fs = require('fs');

// Supabase credentials
const supabaseUrl = 'https://txiaalbplrxmwznnoidt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aWFhbGJwbHJ4bXd6bm5vaWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODU1MzIsImV4cCI6MjA2MzI2MTUzMn0.EC1IdKowDtHmR9NP8UojNZNSutdg1qLST9g0DH3c9qs';

// Create the content of the .env.local file
const envContent = `# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
`;

try {
  // Write to .env.local file
  fs.writeFileSync('.env.local', envContent);
  console.log('Created .env.local file successfully');
} catch (error) {
  console.error('Error creating .env.local file:', error.message);
} 