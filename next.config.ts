import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: 'cdn.deezer.com' }],
  },
}

export default nextConfig
