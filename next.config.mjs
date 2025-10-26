import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default {
  reactStrictMode: true,
  // experimental: {
  //   appDir: true
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
};
