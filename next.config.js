/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static HTML export
  distDir: 'out',    // Custom build directory for the static export
  images: {
    unoptimized: true, // Needed for static export
  },
  // Make sure styled-components works properly with SSR
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig; 