/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@privy-io/react-auth'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.chunkLoadingGlobal = 'webpackChunkParadoxApp';
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
