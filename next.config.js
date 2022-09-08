/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ["i.scdn.co", "s3.amazonaws.com"],
  },
};

module.exports = nextConfig;
