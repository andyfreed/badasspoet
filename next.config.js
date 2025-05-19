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
};

module.exports = nextConfig; 