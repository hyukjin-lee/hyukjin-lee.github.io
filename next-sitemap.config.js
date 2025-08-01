/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://hyukjin-lee.github.io',
  generateRobotsTxt: true,
  exclude: ['/404'],
  additionalPaths: async (config) => {
    const result = []
    
    // 정적 페이지들
    result.push(
      await config.transform(config, '/'),
      await config.transform(config, '/about'),
      await config.transform(config, '/blog'),
      await config.transform(config, '/tech'),
      await config.transform(config, '/daily')
    )
    
    return result
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/404'],
      },
    ],
    additionalSitemaps: [
      'https://hyukjin-lee.github.io/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },
}