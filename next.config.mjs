/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/agent/:path*',
          destination: 'http://127.0.0.1:8000/api/agent/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
