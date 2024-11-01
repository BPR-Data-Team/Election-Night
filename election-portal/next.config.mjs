/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/Election-Night' : '',
  assetPrefix: isProd ? '/Election-Night/' : '',
};

export default nextConfig;
