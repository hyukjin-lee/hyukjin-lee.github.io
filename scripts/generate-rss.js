const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const matter = require('gray-matter');

const BASE_URL = 'https://hyukjin-lee.github.io';
const LOCALES = ['ko', 'en'];
const CATEGORIES = ['blog', 'tech', 'daily'];

const POSTS_DIR = path.join(process.cwd(), '_posts');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const ensureLocalePublicDir = (locale) => {
  if (locale === 'ko') {
    return PUBLIC_DIR;
  }
  const localeDir = path.join(PUBLIC_DIR, locale);
  if (!fs.existsSync(localeDir)) {
    fs.mkdirSync(localeDir, { recursive: true });
  }
  return localeDir;
};

const getLocalePrefix = (locale) => (locale === 'ko' ? '' : `/${locale}`);

const parseDateSegments = (dateValue, filename) => {
  if (dateValue) {
    const date = new Date(dateValue);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return { year, month, day, date };
  }

  const name = filename.replace(/\.md$/, '');
  const [year, month, day] = name.split('-');
  const fallbackDate = new Date(`${year}-${month}-${day}`);

  return {
    year,
    month,
    day,
    date: fallbackDate,
  };
};

const collectPosts = (locale) => {
  const posts = [];

  CATEGORIES.forEach((category) => {
    const categoryDir = path.join(POSTS_DIR, locale, category);
    if (!fs.existsSync(categoryDir)) {
      return;
    }

    const filenames = fs.readdirSync(categoryDir).filter((file) => file.endsWith('.md'));
    filenames.forEach((filename) => {
      const filePath = path.join(categoryDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      const slug = data.slug || filename.replace(/\.md$/, '').split('-').slice(3).join('-');
      const { year, month, day, date } = parseDateSegments(data.date, filename);
      const localePrefix = getLocalePrefix(locale);
      const postPath = `${localePrefix}/${category}/${year}/${month}/${day}/${slug}`.replace(/\/{2,}/g, '/');
      const url = `${BASE_URL}${postPath === '/' ? '' : postPath}`;

      posts.push({
        title: data.title,
        url,
        guid: url,
        description: content,
        date,
      });
    });
  });

  return posts.sort((a, b) => b.date - a.date);
};

function generateFeedForLocale(locale) {
  const sitePrefix = getLocalePrefix(locale);
  const siteUrl = `${BASE_URL}${sitePrefix || ''}`;
  const feedPath = locale === 'ko' ? '/rss.xml' : `/${locale}/rss.xml`;

  const feed = new RSS({
    title: locale === 'ko' ? 'terrace (KO)' : 'terrace (EN)',
    description: 'hyukjin lee\'s dev blog',
    feed_url: `${BASE_URL}${feedPath}`,
    site_url: siteUrl || BASE_URL,
    language: locale,
    pubDate: new Date(),
    copyright: `${new Date().getFullYear()} hyukjin lee`,
  });

  const posts = collectPosts(locale);
  posts.forEach((post) => {
    feed.item({
      title: post.title,
      guid: post.guid,
      url: post.url,
      date: post.date,
      description: post.description,
      author: 'hyukjin lee',
    });
  });

  const rss = feed.xml({ indent: true });
  const outputDir = ensureLocalePublicDir(locale);
  fs.writeFileSync(path.join(outputDir, 'rss.xml'), rss);

  console.log(`RSS feed generated for locale: ${locale}`);
}

function generateRssFeed() {
  LOCALES.forEach((locale) => generateFeedForLocale(locale));
}

generateRssFeed();
