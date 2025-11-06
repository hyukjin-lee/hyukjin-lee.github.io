
const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const matter = require('gray-matter');

async function generateRssFeed() {
  const site_url = 'https://hyukjin-lee.github.io';

  const feed = new RSS({
    title: 'terrace',
    description: 'hyukjin lee\'s dev blog',
    feed_url: `${site_url}/rss.xml`,
    site_url: site_url,
    language: 'ko',
    pubDate: new Date(),
    copyright: `${new Date().getFullYear()} hyukjin lee`,
  });

  const postTypes = ['blog', 'tech', 'daily'];
  let allPosts = [];

  postTypes.forEach(type => {
    const postDir = path.join(process.cwd(), `_posts/${type}`);
    if (!fs.existsSync(postDir)) return;

    const filenames = fs.readdirSync(postDir);
    const posts = filenames.map(filename => {
      const filePath = path.join(postDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      const slug = filename.replace(/\.md$/, '');
      const [year, month, day, ...rest] = slug.split('-');
      const postUrl = `${site_url}/${type}/${year}/${month}/${rest.join('-')}`;

      return {
        ...data,
        url: postUrl,
        guid: postUrl,
        description: content,
        date: new Date(data.date),
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
