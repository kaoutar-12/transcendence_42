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
};

export default nextConfig;