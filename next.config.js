// Use require (CommonJS) to import the plugin
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true', // Only enable when ANALYZE env var is 'true'
});

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['cdn.sanity.io', 'image.mux.com'],
    loader: 'custom',
    loaderFile: './lib/sanityImageLoader.ts', 
  },
  compiler: {
    styledComponents: true,
  },
};

// Use module.exports (CommonJS) to export the wrapped config
module.exports = withBundleAnalyzer(nextConfig);