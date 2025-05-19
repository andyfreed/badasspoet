const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables.');
  console.error('Make sure you have created .env.local with the required variables.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL from file
const sql = fs.readFileSync('./create-examples-table.sql', 'utf8');

// Execute SQL
async function createTable() {
  console.log('Creating examples table in Supabase...');
  
  try {
    const { data, error } = await supabase.rpc('pgdo', { query: sql });
    
    if (error) {
      throw error;
    }
    
    console.log('Success! The examples table has been created with sample data.');
    console.log('You should now be able to see data in your application.');
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    if (error.message.includes('permission denied')) {
      console.error('\nPermission denied error: You cannot execute this SQL with the anon key.');
      console.error('Solution: Go to your Supabase dashboard > SQL Editor and run the SQL directly.');
      console.log('\nAlternative: Run this SQL in the Supabase dashboard SQL Editor:');
      console.log('---------------------------------------------------------');
      console.log(sql);
      console.log('---------------------------------------------------------');
    }
  }
}

createTable(); 