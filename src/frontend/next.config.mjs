/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false,
  images: {
    remotePatterns: [
      {
        hostname: "loremflickr.com",
        pathname: "/**", // Correct pattern for all paths
        protocol: "https",
      },
    ],
  },
  reactStrictMode: false,
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      // destination: 'https://api.intra.42.fr/oauth/authorize'+'?client_id='+process.env.UID+'&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Foauth%2F&response_type=code',
      // Wildcard path matching
      {
        source: '/oauth',
        destination: `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.UID}&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Foauth%2F&response_type=code`,
        permanent: true,
        basePath: false,
      },
    ]
  },
};


export default nextConfig;
