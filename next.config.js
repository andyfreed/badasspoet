/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static HTML export
  distDir: 'out',    // Custom build directory for the static export
  trailingSlash: true, // Add trailing slash to ensure index.html files are generated
  images: {
    unoptimized: true, // Needed for static export
  },
  // Make sure styled-components works properly with SSR
  compiler: {
    styledComponents: true,
  },
  // Ignore TypeScript errors in build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add environment variables that need to be exposed to the client
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Extra for development
  publicRuntimeConfig: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

// Log environment variables for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Environment variables in next.config.js:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
}

module.exports = nextConfig; 