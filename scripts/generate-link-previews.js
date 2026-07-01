const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '..', '_posts');
const DATA_DIR = path.join(__dirname, '..', 'data');
const LINK_PREVIEWS_FILE = path.join(DATA_DIR, 'link-previews.json');
const SCREENSHOT_DIR = path.join(__dirname, '..', 'public', 'images', 'link-previews');
const SCREENSHOT_PUBLIC_PATH = '/images/link-previews';
const MIN_PREVIEW_IMAGE_BYTES = 2048;

// URL 정규식 패턴
const URL_REGEX = /(https?:\/\/[^\s<>"'`\]]+)/g;
const KOREAN_POSTPOSITIONS = [
  '으로', '에서', '에게', '부터', '까지', '처럼',
  '은', '는', '이', '가', '을', '를', '와', '과', '도', '에', '로', '만', '의'
];

function trimUnmatchedClosingParens(url) {
  let result = url;

  while (result.endsWith(')')) {
    const openCount = (result.match(/\(/g) || []).length;
    const closeCount = (result.match(/\)/g) || []).length;
    if (closeCount <= openCount) break;
    result = result.slice(0, -1);
  }

  return result;
}

function normalizeExtractedUrl(rawUrl) {
  let url = rawUrl
    .replace(/&amp;/g, '&')
    .trim()
    .split('](')[0]
    .replace(/[.,!?;:]+$/g, '');

  let changed = true;
  while (changed) {
    changed = false;

    for (const particle of KOREAN_POSTPOSITIONS) {
      if (url.endsWith(particle) && /[)\]}]$/.test(url.slice(0, -particle.length))) {
        url = url.slice(0, -particle.length);
        changed = true;
        break;
      }
    }

    const trimmed = trimUnmatchedClosingParens(url).replace(/[\]}]+$/g, '');
    if (trimmed !== url) {
      url = trimmed;
      changed = true;
    }
  }

  return url;
}

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
  const urls = [];
  let match;

  while ((match = URL_REGEX.exec(content)) !== null) {
    const markdownIndex = match.index;
    const isInIframe = content.slice(Math.max(0, markdownIndex - 50), markdownIndex).includes('<iframe');

    if (!isInIframe) {
      urls.push(normalizeExtractedUrl(match[0]));
    }
  }

  return [...new Set(urls.filter(Boolean))]; // 중복 제거
}

function isYouTubeUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname === 'youtube.com' || hostname === 'youtu.be';
  } catch {
    return false;
  }
}

function isGenericYouTubeTitle(title) {
  return !title || title === 'YouTube' || title === '- YouTube';
}

async function scrapeYouTubeOEmbed(url) {
  const response = await axios.get('https://www.youtube.com/oembed', {
    timeout: 10000,
    params: { url, format: 'json' },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  return {
    url,
    title: response.data.title || url,
    description: response.data.author_name ? `YouTube - ${response.data.author_name}` : '',
    image: response.data.thumbnail_url || '',
    siteName: response.data.provider_name || 'YouTube',
    scrapedAt: new Date().toISOString()
  };
}

async function isReachableImage(url) {
  if (!url) return false;
  if (isLikelyPlaceholderImageUrl(url)) return false;

  try {
    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const contentType = response.headers['content-type'] || '';
    const contentLength = Number(response.headers['content-length'] || 0);
    return contentType.startsWith('image/') && (
      !contentLength || contentLength >= MIN_PREVIEW_IMAGE_BYTES
    );
  } catch {
    return false;
  }
}

function isLikelyPlaceholderImageUrl(url) {
  try {
    const { pathname } = new URL(url);
    return /(?:blank|spacer|transparent|pixel|1x1)\.(?:png|gif|jpe?g|webp)$/i.test(pathname);
  } catch {
    return false;
  }
}

async function selectReachableImage(candidates) {
  const uniqueCandidates = [...new Set(candidates.map(image => image?.trim()).filter(Boolean))];

  for (const image of uniqueCandidates) {
    if (await isReachableImage(image)) {
      return image;
    }
  }

  return '';
}

function findChromeExecutable() {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];

  const existingCandidate = candidates.find(candidate => fs.existsSync(candidate));
  if (existingCandidate) return existingCandidate;

  for (const command of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
    try {
      return execFileSync('which', [command], { encoding: 'utf8' }).trim();
    } catch {
      // Continue checking other known browser commands.
    }
  }

  return '';
}

function screenshotFileNameForUrl(url) {
  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 20);
  return `${hash}.png`;
}

function isLocalScreenshotImage(image) {
  return image?.startsWith(`${SCREENSHOT_PUBLIC_PATH}/`);
}

function hasLocalScreenshotFile(image) {
  if (!isLocalScreenshotImage(image)) return false;
  return fs.existsSync(path.join(__dirname, '..', 'public', image));
}

async function capturePageScreenshot(url) {
  const executablePath = findChromeExecutable();
  if (!executablePath) {
    console.warn(`Warning: Chrome executable not found; skipping screenshot fallback for ${url}`);
    return '';
  }

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const fileName = screenshotFileNameForUrl(url);
  const filePath = path.join(SCREENSHOT_DIR, fileName);
  const publicPath = `${SCREENSHOT_PUBLIC_PATH}/${fileName}`;

  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  let browser;
  try {
    console.log(`Capturing screenshot fallback for: ${url}`);
    const puppeteer = require('puppeteer-core');
    browser = await puppeteer.launch({
      executablePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--hide-scrollbars',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise(resolve => setTimeout(resolve, 1500));
    await page.screenshot({ path: filePath, type: 'png' });
    return publicPath;
  } catch (error) {
    console.warn(`Warning: Could not capture screenshot for ${url}: ${error.message}`);
    return '';
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function shouldRefreshPreview(url, preview) {
  if (!preview) return true;
  if (preview.error && !preview.title) return true;

  if (isYouTubeUrl(url)) {
    return isGenericYouTubeTitle(preview.title) || !preview.image;
  }

  if (preview.image?.includes('ingress-comporellon.ewp.live')) return true;
  if (preview.image && isLikelyPlaceholderImageUrl(preview.image)) return true;
  if (isLocalScreenshotImage(preview.image) && !hasLocalScreenshotFile(preview.image)) return true;
  if (preview.image === '') return true;

  return false;
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

    const image = await selectReachableImage([
      document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
      document.querySelector('meta[property="og:image:secure_url"]')?.getAttribute('content'),
    ]);
    const previewImage = image || await capturePageScreenshot(url);

    const siteName = 
      document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
      new URL(url).hostname;

    const metadata = {
      url,
      title: title.trim(),
      description: description.trim(),
      image: previewImage.trim(),
      siteName: siteName.trim(),
      scrapedAt: new Date().toISOString()
    };

    if (isYouTubeUrl(url) && (isGenericYouTubeTitle(metadata.title) || !metadata.image)) {
      return await scrapeYouTubeOEmbed(url);
    }

    return metadata;

  } catch (error) {
    if (isYouTubeUrl(url)) {
      try {
        return await scrapeYouTubeOEmbed(url);
      } catch (oEmbedError) {
        console.error(`Error scraping YouTube oEmbed ${url}:`, oEmbedError.message);
      }
    }

    console.error(`Error scraping ${url}:`, error.message);
    const screenshotImage = await capturePageScreenshot(url);

    return {
      url,
      title: url,
      description: '',
      image: screenshotImage,
      siteName: new URL(url).hostname,
      error: error.message,
      scrapedAt: new Date().toISOString()
    };
  }
}

// 모든 마크다운 파일에서 URL 수집
function collectAllUrls() {
  const allUrls = new Set();
  
  // life, work, log 디렉토리 스캔
  const categories = ['life', 'work', 'log'];
  
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
  const loadedPreviews = loadExistingPreviews();
  console.log(`📋 Loaded ${Object.keys(loadedPreviews).length} existing previews`);

  // 모든 URL 수집
  const allUrls = collectAllUrls();
  console.log(`🔍 Found ${allUrls.length} unique URLs`);

  const allUrlSet = new Set(allUrls);
  const existingPreviews = Object.fromEntries(
    Object.entries(loadedPreviews).filter(([url]) => allUrlSet.has(url))
  );

  // 새로운 URL만 스크래핑
  const newUrls = allUrls.filter(url => shouldRefreshPreview(url, existingPreviews[url]));
  
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
