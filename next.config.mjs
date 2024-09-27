/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "loremflickr.com",
        pathname: "*/**",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
