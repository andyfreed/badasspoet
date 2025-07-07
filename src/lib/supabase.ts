import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client with fallback values for build time
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Check if environment variables are available at runtime
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Missing Supabase environment variables:', {
        url: supabaseUrl ? 'Set' : 'Not set',
        key: supabaseAnonKey ? 'Set' : 'Not set'
      });
    }
    return false;
  }
  return true;
};

if (process.env.NODE_ENV === 'development' && supabaseUrl && supabaseAnonKey) {
  console.log('Supabase client initialized with URL:', supabaseUrl);
} 