const fs = require('fs');
const path = require('path');

// 기존 Strapi 데이터를 Markdown으로 변환
function convertStrapiToMarkdown() {
  const dataDir = path.join(__dirname, '..', 'data');
  const postsDir = path.join(__dirname, '..', '_posts');

  // Blog 데이터 변환
  if (fs.existsSync(path.join(dataDir, 'blog-articles.json'))) {
    const blogData = JSON.parse(fs.readFileSync(path.join(dataDir, 'blog-articles.json'), 'utf8'));
    
    blogData.forEach(article => {
      const { attributes } = article;
      const date = new Date(attributes.date);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const frontmatter = `---
id: ${article.id}
seq: ${attributes.seq}
title: "${attributes.title}"
date: "${attributes.date}"
updatedAt: "${attributes.updatedAt}"
slug: "${attributes.slug}"
category: "life"
---

${attributes.content}`;

      const filename = `${dateStr}-${attributes.slug}.md`;
      const filepath = path.join(postsDir, 'life', filename);
      
      fs.writeFileSync(filepath, frontmatter);
      console.log(`✅ Created: _posts/life/${filename}`);
    });
  }

  // Tech 데이터 변환
  if (fs.existsSync(path.join(dataDir, 'tech-articles.json'))) {
    const techData = JSON.parse(fs.readFileSync(path.join(dataDir, 'tech-articles.json'), 'utf8'));
    
    techData.forEach(article => {
      const { attributes } = article;
      const date = new Date(attributes.date);
      const dateStr = date.toISOString().split('T')[0];
      
      const frontmatter = `---
id: ${article.id}
seq: ${attributes.seq}
title: "${attributes.title}"
date: "${attributes.date}"
updatedAt: "${attributes.updatedAt}"
slug: "${attributes.slug}"
category: "work"
---

${attributes.content}`;

      const filename = `${dateStr}-${attributes.slug}.md`;
      const filepath = path.join(postsDir, 'work', filename);
      
      fs.writeFileSync(filepath, frontmatter);
      console.log(`✅ Created: _posts/work/${filename}`);
    });
  }

  // Daily 데이터 변환
  if (fs.existsSync(path.join(dataDir, 'dailies.json'))) {
    const dailyData = JSON.parse(fs.readFileSync(path.join(dataDir, 'dailies.json'), 'utf8'));
    
    dailyData.forEach(post => {
      const { attributes } = post;
      const date = new Date(attributes.date);
      const dateStr = date.toISOString().split('T')[0];
      
      const frontmatter = `---
id: ${post.id}
seq: ${attributes.seq}
title: "${attributes.title}"
date: "${attributes.date}"
updatedAt: "${attributes.updatedAt}"
slug: "${attributes.slug}"
category: "log"
---

${attributes.content}`;

      const filename = `${dateStr}-${attributes.slug}.md`;
      const filepath = path.join(postsDir, 'log', filename);
      
      fs.writeFileSync(filepath, frontmatter);
      console.log(`✅ Created: _posts/log/${filename}`);
    });
  }
}

if (require.main === module) {
  console.log('🚀 Starting Strapi → Markdown migration...');
  convertStrapiToMarkdown();
  console.log('🎉 Migration completed!');
}

module.exports = { convertStrapiToMarkdown };