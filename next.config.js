/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 1000,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
  },
  // Repository 이름 변경으로 루트 경로 사용
  experimental: {
    // 정적 생성을 위한 설정
    isrMemoryCacheSize: 0,
  }
};
