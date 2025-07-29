/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 1000,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/terrace' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/terrace' : '',
  experimental: {
    // 정적 생성을 위한 설정
    isrMemoryCacheSize: 0,
  }
};
