/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows Vercel to build successfully even if TypeScript complains about CSS imports
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Bypasses Vercel's image optimization limits and loads directly from Supabase
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tcebzxowvvcheikuhitx.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;