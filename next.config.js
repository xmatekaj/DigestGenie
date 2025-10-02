/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH === '' ? undefined : (process.env.NEXT_PUBLIC_BASE_PATH || undefined),
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
