import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Create a single supabase client for the entire app
// Adding try/catch to prevent runtime errors
let supabaseClient;
try {
  if (!env.isSupabaseConfigured()) {
    console.warn('Supabase environment variables are not properly configured.');
    // Create a dummy client in development to prevent runtime errors
    if (process.env.NODE_ENV === 'development') {
      supabaseClient = {
        from: () => ({
          select: () => Promise.resolve({ 
            data: [], 
            error: { message: 'Supabase not configured - check .env.local file' } 
          })
        })
      };
    } else {
      // In production, try to create a client with empty strings
      // This will likely fail but allows the site to load
      supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    }
  } else {
    // Normal initialization with valid environment variables
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a placeholder client that won't throw runtime errors
  supabaseClient = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: { message: 'Supabase initialization error' } })
    })
  };
}

export const supabase = supabaseClient; 