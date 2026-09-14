/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/agent/:path*',
        destination: 'http://127.0.0.1:8000/api/agent/:path*',
      },
    ];
  },
};

export default nextConfig;
