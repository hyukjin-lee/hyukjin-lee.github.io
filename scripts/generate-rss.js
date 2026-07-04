
const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const matter = require('gray-matter');

async function generateRssFeed() {
  const site_url = 'https://hyukjin-lee.github.io';

  const feed = new RSS({
    title: 'terrace',
    description: 'hyukjin lee\'s site',
    feed_url: `${site_url}/rss.xml`,
    site_url: site_url,
    language: 'ko',
    pubDate: new Date(),
    copyright: `${new Date().getFullYear()} hyukjin lee`,
  });

  const postTypes = ['life', 'work', 'log'];
  let allPosts = [];

  postTypes.forEach(type => {
    const postDir = path.join(process.cwd(), `_posts/${type}`);
    if (!fs.existsSync(postDir)) return;

    const filenames = fs.readdirSync(postDir).filter(filename => filename.endsWith('.md'));
    const posts = filenames.map(filename => {
      const filePath = path.join(postDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      const date = data.date instanceof Date ? data.date : new Date(data.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const postSlug = data.slug || filename.replace(/\.md$/, '').split('-').slice(3).join('-');
      const postUrl = `${site_url}/${type}/${year}/${month}/${day}/${postSlug}`;

      return {
        ...data,
        url: postUrl,
        guid: postUrl,
        description: content.replace(/[ \t]+$/gm, ''),
        date,
      };
    });
    allPosts.push(...posts);
  });

  allPosts.sort((a, b) => b.date - a.date);

  allPosts.forEach(post => {
    feed.item({
      title: post.title,
      guid: post.url,
      url: post.url,
      date: post.date,
      description: post.description,
      author: 'hyukjin lee',
    });
  });

  const rss = feed.xml({ indent: true });
  fs.writeFileSync(path.join(process.cwd(), 'public/rss.xml'), rss);
  console.log('RSS feed generated!');
}

generateRssFeed();
