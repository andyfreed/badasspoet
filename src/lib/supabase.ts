import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Create a single supabase client for the entire app
// with proper typing to fix TypeScript errors
let supabaseClient;

try {
  if (!env.isSupabaseConfigured()) {
    console.warn('Supabase environment variables are not properly configured.');
    // In development, create a dummy client that won't throw runtime errors
    if (process.env.NODE_ENV === 'development') {
      // Create a mock client for development with required methods
      const mockSupabase = {
        from: () => ({
          select: () => Promise.resolve({ 
            data: [], 
            error: { message: 'Supabase not configured - check .env.local file' } 
          }),
          order: () => ({
            select: () => Promise.resolve({ 
              data: [], 
              error: { message: 'Supabase not configured - check .env.local file' } 
            })
          })
        }),
        auth: {
          getSession: () => Promise.resolve({ data: { session: null } }),
          onAuthStateChange: () => ({ 
            data: { subscription: { unsubscribe: () => {} } } 
          }),
          signUp: () => Promise.resolve({ data: { user: null }, error: null }),
          signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
          signOut: () => Promise.resolve({ error: null })
        },
        rpc: () => Promise.resolve({ data: null, error: null })
      };
      supabaseClient = mockSupabase;
    } else {
      // In production, try to create a client with empty strings
      supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    }
  } else {
    // Normal initialization with valid environment variables
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a placeholder client with auth methods
  supabaseClient = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: { message: 'Supabase initialization error' } })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } } 
      }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    rpc: () => Promise.resolve({ data: null, error: null })
  };
}

export const supabase = supabaseClient; 