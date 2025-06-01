/**
 * Helper functions for managing environment variables
 */

export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Check if all required environment variables are set
  isSupabaseConfigured: function() {
    return !!this.SUPABASE_URL && !!this.SUPABASE_ANON_KEY;
  },
  
  // Debug helper
  logEnvStatus: function() {
    console.log('Environment Variables Status:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', this.SUPABASE_URL ? 'Set' : 'Not set');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', this.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    console.log('Ready for Supabase:', this.isSupabaseConfigured() ? 'Yes' : 'No');
  }
};

// Log environment status in development
if (process.env.NODE_ENV !== 'production') {
  env.logEnvStatus();
} 