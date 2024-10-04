/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    output: 'export', // Ensures Next.js exports static HTML
  };
  
  export default nextConfig;