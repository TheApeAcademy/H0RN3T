import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(glb|gltf|hdr|exr)$/,
      type: 'asset/resource',
    })
    return config
  },
}

export default nextConfig
