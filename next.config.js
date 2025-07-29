/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 1000,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages repository 이름이 terrace이므로 /terrace 경로 필요
  assetPrefix: '/terrace',
  basePath: '/terrace',
  experimental: {
    // 정적 생성을 위한 설정
    isrMemoryCacheSize: 0,
  }
};
