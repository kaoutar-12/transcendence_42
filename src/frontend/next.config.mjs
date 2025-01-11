// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         hostname: "loremflickr.com",
//         pathname: "*/**",
//         protocol: "https",
//       },
//     ],
//   },
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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

module.exports = nextConfig;