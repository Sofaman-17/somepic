import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Permite imágenes de Supabase Storage y fuentes externas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
