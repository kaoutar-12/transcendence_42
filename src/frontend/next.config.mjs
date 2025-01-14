/** @type {import('next').NextConfig} */
const nextConfig = {
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