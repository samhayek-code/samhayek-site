/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/tools', destination: '/code', permanent: true },
      { source: '/tools/:slug*', destination: '/code/:slug*', permanent: true },
    ]
  },
}

module.exports = nextConfig
