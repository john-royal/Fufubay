const { withSuperjson } = require('next-superjson')

module.exports = withSuperjson()({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fufubaycdn.johnmroyal.com',
        pathname: '/**'
      }
    ]
  }
})
