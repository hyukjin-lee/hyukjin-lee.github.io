const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_HOST = "https://rough-leaf-7947.fly.dev/api";
const AUTH_TOKEN = "fd006b67bd28f2860e1d1cd1714b2be4b6fbe4c4eb28c89e2cb9c982c1b33f8f92a331de3ce369680f4672dedb022e7d1e81a398c6038d3eb490172e4d38cc472061104ce55a08720026e18bc4c3e4c8a6f4d6ce3099004c251a62812ddce412a7f0023b397aaab37ae60deed33d96a4c12f9e2d82ff83e94a5f445ad87ec399";

const axiosInstance = axios.create({
  baseURL: API_HOST,
  headers: {
    "Authorization": `Bearer ${AUTH_TOKEN}`
  }
});

const DATA_DIR = path.join(__dirname, '..', 'data');

// 데이터 디렉토리 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchAllPages(endpoint, pageSize = 100) {
  let allData = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      console.log(`Fetching ${endpoint} - page ${page}`);
      const response = await axiosInstance.get(endpoint, {
        params: {
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          sort: ['seq:desc']
        }
      });

      const { data, meta } = response.data;
      allData = allData.concat(data);

      hasMore = page < meta.pagination.pageCount;
      page++;
    } catch (error) {
      console.error(`Error fetching ${endpoint} page ${page}:`, error.message);
      break;
    }
  }

  return allData;
}

async function fetchSingleEndpoint(endpoint) {
  try {
    console.log(`Fetching ${endpoint}`);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting data extraction from Strapi...');

  try {
    // Life articles 추출
    console.log('\n📝 Fetching life articles...');
    const lifeArticles = await fetchAllPages('/blog-articles');
    fs.writeFileSync(
      path.join(DATA_DIR, 'blog-articles.json'),
      JSON.stringify(lifeArticles, null, 2)
    );
    console.log(`✅ Saved ${lifeArticles.length} life articles`);

    // Work articles 추출
    console.log('\n💻 Fetching work articles...');
    const workArticles = await fetchAllPages('/tech-articles');
    fs.writeFileSync(
      path.join(DATA_DIR, 'tech-articles.json'),
      JSON.stringify(workArticles, null, 2)
    );
    console.log(`✅ Saved ${workArticles.length} work articles`);

    // Log posts 추출
    console.log('\n📅 Fetching log posts...');
    const logPosts = await fetchAllPages('/dailies');
    fs.writeFileSync(
      path.join(DATA_DIR, 'dailies.json'),
      JSON.stringify(logPosts, null, 2)
    );
    console.log(`✅ Saved ${logPosts.length} log posts`);

    // Musings 추출
    console.log('\n💭 Fetching musings...');
    const musings = await fetchAllPages('/musings');
    fs.writeFileSync(
      path.join(DATA_DIR, 'musings.json'),
      JSON.stringify(musings, null, 2)
    );
    console.log(`✅ Saved ${musings.length} musings`);

    // About 정보 추출
    console.log('\n👤 Fetching about info...');
    const about = await fetchSingleEndpoint('/about');
    if (about) {
      fs.writeFileSync(
        path.join(DATA_DIR, 'about.json'),
        JSON.stringify(about, null, 2)
      );
      console.log('✅ Saved about information');
    }

    // 각 콘텐츠 타입별로 개별 파일들도 생성 (getStaticPaths용)
    console.log('\n🔧 Creating individual content files...');
    
    // Life 개별 파일들
    const lifeDir = path.join(DATA_DIR, 'life');
    if (!fs.existsSync(lifeDir)) fs.mkdirSync(lifeDir, { recursive: true });
    
    for (const article of lifeArticles) {
      fs.writeFileSync(
        path.join(lifeDir, `${article.attributes.slug}.json`),
        JSON.stringify(article, null, 2)
      );
    }

    // Work 개별 파일들
    const workDir = path.join(DATA_DIR, 'work');
    if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });
    
    for (const article of workArticles) {
      fs.writeFileSync(
        path.join(workDir, `${article.attributes.slug}.json`),
        JSON.stringify(article, null, 2)
      );
    }

    // Log 개별 파일들
    const logDir = path.join(DATA_DIR, 'log');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    
    for (const post of logPosts) {
      fs.writeFileSync(
        path.join(logDir, `${post.attributes.slug}.json`),
        JSON.stringify(post, null, 2)
      );
    }

    console.log('\n🎉 Data extraction completed successfully!');
    console.log(`📁 Data saved to: ${DATA_DIR}`);
    
  } catch (error) {
    console.error('❌ Data extraction failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
