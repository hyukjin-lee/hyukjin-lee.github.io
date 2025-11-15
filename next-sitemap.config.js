const SITE_URL = process.env.SITE_URL || 'https://hyukjin-lee.github.io';
const SUPPORTED_LOCALES = ['ko', 'en'];
const DEFAULT_LOCALE = 'ko';
const BASE_PATHS = ['/', '/about', '/blog', '/tech', '/daily'];

const ensureLeadingSlash = (path) => {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
};

const stripLocaleFromPath = (path) => {
  const normalized = ensureLeadingSlash(path);
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    const prefix = `/${locale}`;
    if (normalized === prefix) {
      return '/';
    }
    if (normalized.startsWith(`${prefix}/`)) {
      const stripped = normalized.slice(prefix.length);
      return stripped === '' ? '/' : stripped;
    }
  }

  return normalized;
};

const localizePath = (path, locale) => {
  const normalized = stripLocaleFromPath(path);
  if (locale === DEFAULT_LOCALE) {
    return normalized;
  }
  if (normalized === '/') {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`.replace(/\/{2,}/g, '/');
};

const buildAlternateRefs = (path) => {
  const basePath = stripLocaleFromPath(path);
  const refs = SUPPORTED_LOCALES.map((locale) => {
    const localized = localizePath(basePath, locale);
    return {
      href: `${SITE_URL}${localized === '/' ? '' : localized}`,
      hreflang: locale,
    };
  });

  const defaultHref = refs.find((ref) => ref.hreflang === DEFAULT_LOCALE)?.href || refs[0]?.href || SITE_URL;
  return [
    ...refs,
    {
      href: defaultHref,
      hreflang: 'x-default',
    },
  ];
};

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/404'],
  additionalPaths: async (config) => {
    const result = [];
    
    for (const basePath of BASE_PATHS) {
      for (const locale of SUPPORTED_LOCALES) {
        const localizedPath = localizePath(basePath, locale);
        result.push(await config.transform(config, localizedPath));
      }
    }
    
    return result;
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
  },
  transform: async (config, path) => {
    const normalizedPath = ensureLeadingSlash(path);
    return {
      loc: normalizedPath,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: buildAlternateRefs(normalizedPath),
    };
  },
};
