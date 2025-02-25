/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "loremflickr.com",
        pathname: "/**", // Correct pattern for all paths
        protocol: "https",
      },
      {
        hostname: "localhost",
        pathname:"/**",  // Correct pattern for all paths
        protocol: "https",
      },
      {
        hostname: "backend",
        pathname:"/**",  // Correct pattern for all paths
        protocol: "https",
      },
    ],
  },

  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/oauth1',
        destination: `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_UID}&redirect_uri=https%3A%2F%2F${process.env.ip_adress}%2Fcall%2F&response_type=code`,
        permanent: true,
        basePath: false,
      },
    ]
  },
};


export default nextConfig;
