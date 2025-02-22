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
      {
        hostname: "localhost",
        pathname: "/**", // Correct pattern for all paths
        protocol: "http",
      },
      {
        hostname: "backend",
        pathname: "/**", // Correct pattern for all paths
        protocol: "http",
      },
    ],
  },
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/oauth1',
        destination: `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_UID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcall%2F&response_type=code`,
        permanent: true,
        basePath: false,
      },
    ]
  },
};


export default nextConfig;
