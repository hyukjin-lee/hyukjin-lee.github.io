const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '..', '_posts');
const DATA_DIR = path.join(__dirname, '..', 'data');
const LINK_PREVIEWS_FILE = path.join(DATA_DIR, 'link-previews.json');

// URL 정규식 패턴
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// 기존 링크 프리뷰 데이터 로드
function loadExistingPreviews() {
  if (fs.existsSync(LINK_PREVIEWS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LINK_PREVIEWS_FILE, 'utf8'));
    } catch (error) {
      console.log('Warning: Could not load existing link previews, starting fresh');
    }
  }
  return {};
}

// 마크다운 콘텐츠에서 URL 추출
function extractUrlsFromMarkdown(content) {
  const urls = content.match(URL_REGEX) || [];
  return [...new Set(urls)]; // 중복 제거
}

// 웹페이지에서 메타데이터 추출
async function scrapeMetadata(url) {
  try {
    console.log(`Scraping metadata for: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Open Graph 메타태그 추출
    const title = 
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
      document.querySelector('title')?.textContent ||
      '';

    const description = 
      document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
      document.querySelector('meta[name="description"]')?.getAttribute('content') ||
      '';

    const image = 
      document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
      '';

    const siteName = 
      document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
      new URL(url).hostname;

    return {
      url,
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      siteName: siteName.trim(),
      scrapedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return {
      url,
      title: url,
      description: '',
      image: '',
      siteName: new URL(url).hostname,
      error: error.message,
      scrapedAt: new Date().toISOString()
    };
  }
}

// 모든 마크다운 파일에서 URL 수집
function collectAllUrls() {
  const allUrls = new Set();
  
  // blog, tech, daily 디렉토리 스캔
  const categories = ['blog', 'tech', 'daily'];
  
  for (const category of categories) {
    const categoryDir = path.join(POSTS_DIR, category);
    if (!fs.existsSync(categoryDir)) continue;

    const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(categoryDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { content } = matter(fileContent);
      
      const urls = extractUrlsFromMarkdown(content);
      urls.forEach(url => allUrls.add(url));
    }
  }

  return Array.from(allUrls);
}

// 메인 실행 함수
async function main() {
  console.log('🔗 Starting link preview generation...');

  // 데이터 디렉토리 생성
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 기존 링크 프리뷰 데이터 로드
  const existingPreviews = loadExistingPreviews();
  console.log(`📋 Loaded ${Object.keys(existingPreviews).length} existing previews`);

  // 모든 URL 수집
  const allUrls = collectAllUrls();
  console.log(`🔍 Found ${allUrls.length} unique URLs`);

  // 새로운 URL만 스크래핑
  const newUrls = allUrls.filter(url => !existingPreviews[url] || 
    (existingPreviews[url].error && !existingPreviews[url].title)
  );
  
  console.log(`🆕 Need to scrape ${newUrls.length} new/failed URLs`);

  // 병렬로 메타데이터 스크래핑 (최대 3개씩)
  const batchSize = 3;
  for (let i = 0; i < newUrls.length; i += batchSize) {
    const batch = newUrls.slice(i, i + batchSize);
    const promises = batch.map(url => scrapeMetadata(url));
    
    try {
      const results = await Promise.all(promises);
      results.forEach(result => {
        existingPreviews[result.url] = result;
      });
      
      console.log(`✅ Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newUrls.length/batchSize)}`);
      
      // 중간 저장 (실패 시 데이터 보존)
      fs.writeFileSync(LINK_PREVIEWS_FILE, JSON.stringify(existingPreviews, null, 2));
      
    } catch (error) {
      console.error('Batch processing error:', error);
    }

    // 요청 간 딜레이 (서버 부하 방지)
    if (i + batchSize < newUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 최종 저장
  fs.writeFileSync(LINK_PREVIEWS_FILE, JSON.stringify(existingPreviews, null, 2));
  
  console.log(`🎉 Link preview generation completed!`);
  console.log(`📁 Saved ${Object.keys(existingPreviews).length} link previews to: ${LINK_PREVIEWS_FILE}`);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Link preview generation failed:', error);
    process.exit(1);
  });
}

module.exports = { main };