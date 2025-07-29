/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 1000,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // 커스텀 도메인 사용시 basePath와 assetPrefix 불필요
  experimental: {
    // 정적 생성을 위한 설정
    isrMemoryCacheSize: 0,
  }
};
