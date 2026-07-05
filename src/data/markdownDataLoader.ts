import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { LifeArticleListStrapi } from "../life/application/port/outgoing/LifeArticleListStrapi";
import { LifeArticleStrapi } from "../life/application/port/outgoing/LifeArticleStrapi";
import { WorkArticleListStrapi } from "../work/application/port/outgoing/WorkArticleListStrapi";
import { WorkArticleStrapi } from "../work/application/port/outgoing/WorkArticleStrapi";
import { LogListStrapi } from "../log/application/port/outgoing/LogListStrapi";
import { LogStrapi } from "../log/application/port/outgoing/LogStrapi";
import { StrapiResponse } from "../common/domain/StrapiResponse";
import { StrapiPagination } from "../common/domain/StrapiPagination";

const POSTS_DIR = path.join(process.cwd(), "_posts");
const LINK_PREVIEWS_FILE = path.join(process.cwd(), "data", "link-previews.json");
const KOREAN_POSTPOSITIONS = [
  "으로", "에서", "에게", "부터", "까지", "처럼",
  "은", "는", "이", "가", "을", "를", "와", "과", "도", "에", "로", "만", "의"
];

export class MarkdownDataLoader {
  private static trimUnmatchedClosingParens(url: string): string {
    let result = url;

    while (result.endsWith(")")) {
      const openCount = (result.match(/\(/g) || []).length;
      const closeCount = (result.match(/\)/g) || []).length;
      if (closeCount <= openCount) break;
      result = result.slice(0, -1);
    }

    return result;
  }

  private static normalizeExtractedUrl(rawUrl: string): string {
    let url = rawUrl
      .replace(/&amp;/g, "&")
      .trim()
      .split("](")[0]
      .replace(/[.,!?;:]+$/g, "");

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

      const trimmed = this.trimUnmatchedClosingParens(url).replace(/[\]}]+$/g, "");
      if (trimmed !== url) {
        url = trimmed;
        changed = true;
      }
    }

    return url;
  }

  // 링크 프리뷰 데이터 로드
  private static loadLinkPreviews(): Record<string, any> {
    try {
      if (fs.existsSync(LINK_PREVIEWS_FILE)) {
        const content = fs.readFileSync(LINK_PREVIEWS_FILE, "utf8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn("Could not load link previews:", error);
    }
    return {};
  }

  // 컨텐츠에서 링크 프리뷰 데이터 추출
  private static getLinkPreviewsForContent(content: string): Record<string, any> {
    const linkPreviews = this.loadLinkPreviews();
    const urlRegex = /(https?:\/\/[^\s<>"'`\]]+)/g;
    const urls = (content.match(urlRegex) || []).map(url => this.normalizeExtractedUrl(url));
    
    const result: Record<string, any> = {};
    urls.forEach(url => {
      if (linkPreviews[url]) {
        result[url] = linkPreviews[url];
      }
    });
    
    return result;
  }

  // gray-matter는 따옴표 없는 YAML 날짜를 JS Date 객체로 파싱함 → 문자열로 변환
  private static toDateString(value: unknown): string {
    if (value instanceof Date) return value.toISOString().split("T")[0];
    return (value as string) ?? "";
  }

  // Helper: Markdown 파일들을 읽어서 Strapi 형식으로 변환
  private static readMarkdownFiles(category: string): any[] {
    const categoryDir = path.join(POSTS_DIR, category);
    if (!fs.existsSync(categoryDir)) return [];

    const files = fs.readdirSync(categoryDir).filter(file => file.endsWith(".md"));
    
    const articles = files.map(filename => {
      const filePath = path.join(categoryDir, filename);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data: frontmatter, content } = matter(fileContent);

      return {
        id: frontmatter.id as number | undefined,
        attributes: {
          seq: frontmatter.seq as number | undefined,
          date: MarkdownDataLoader.toDateString(frontmatter.date),
          updatedAt: MarkdownDataLoader.toDateString(frontmatter.updatedAt),
          slug: frontmatter.slug,
          title: frontmatter.title,
          workTopic: frontmatter.workTopic,
          workType: frontmatter.workType,
          content: content.trim(),
          linkPreviews: this.getLinkPreviewsForContent(content.trim())
        }
      };
    });

    // 날짜 내림차순 정렬 (최신 글이 먼저)
    articles.sort((a, b) =>
      new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime()
    );

    // frontmatter에 seq가 없는 글에 자동 할당 (기존 seq보다 높은 값으로)
    const maxExplicitSeq = articles.reduce((max, a) => Math.max(max, a.attributes.seq ?? 0), 0);
    let nextSeq = maxExplicitSeq;
    // 오래된 글부터 seq를 올려가며 할당하기 위해 역방향 순회
    const reversedForSeq = [...articles].reverse();
    reversedForSeq.forEach(article => {
      if (article.attributes.seq === undefined) {
        nextSeq++;
        article.attributes.seq = nextSeq;
      }
    });

    return articles.map((article, index) => ({
      ...article,
      id: article.id ?? (index + 1),
      attributes: {
        ...article.attributes,
        seq: article.attributes.seq as number
      }
    }));
  }

  // Life 데이터 로더 (기존 인터페이스 유지)
  static getLifeArticles(): LifeArticleListStrapi[] {
    return this.readMarkdownFiles("life");
  }

  static getLifeArticleBySlug(slug: string): LifeArticleStrapi | null {
    return this.readMarkdownFiles("life").find(a => a.attributes.slug === slug) ?? null;
  }

  static getLifeArticlesPaginated(page: number, pageSize = 10): StrapiResponse<any> {
    const allArticles = this.getLifeArticles();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rawData = allArticles.slice(startIndex, endIndex);

    // LifeArticleListResponse 형태로 변환
    const paginatedData = rawData.map(article => ({
      id: article.id.toString(),
      seq: article.attributes.seq,
      date: article.attributes.date,
      uri: `/life${this.formatDatePath(article.attributes.date)}/${article.attributes.slug}`,
      title: article.attributes.title
    }));

    const pagination: StrapiPagination = {
      page,
      pageSize,
      pageCount: Math.ceil(allArticles.length / pageSize),
      total: allArticles.length
    };

    return {
      data: paginatedData,
      meta: { pagination }
    };
  }

  // Work 데이터 로더 (기존 인터페이스 유지)
  static getWorkArticles(): WorkArticleListStrapi[] {
    return this.readMarkdownFiles("work");
  }

  static getWorkArticleBySlug(slug: string): WorkArticleStrapi | null {
    return this.readMarkdownFiles("work").find(a => a.attributes.slug === slug) ?? null;
  }

  static getWorkArticlesPaginated(page: number, pageSize = 10): StrapiResponse<any> {
    const allArticles = this.getWorkArticles();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rawData = allArticles.slice(startIndex, endIndex);

    // WorkArticleListResponse 형태로 변환
    const paginatedData = rawData.map(article => ({
      id: article.id.toString(),
      seq: article.attributes.seq,
      date: article.attributes.date,
      uri: `/work${this.formatDatePath(article.attributes.date)}/${article.attributes.slug}`,
      title: article.attributes.title,
      workTopic: article.attributes.workTopic,
      workType: article.attributes.workType
    }));

    const pagination: StrapiPagination = {
      page,
      pageSize,
      pageCount: Math.ceil(allArticles.length / pageSize),
      total: allArticles.length
    };

    return {
      data: paginatedData,
      meta: { pagination }
    };
  }

  // Log 데이터 로더 (기존 인터페이스 유지)
  static getLogPosts(): LogListStrapi[] {
    return this.readMarkdownFiles("log");
  }

  static getLogPostBySlug(slug: string): LogStrapi | null {
    return this.readMarkdownFiles("log").find(p => p.attributes.slug === slug) ?? null;
  }

  static getLogPostsPaginated(page: number, pageSize = 10): StrapiResponse<any> {
    const allPosts = this.getLogPosts();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rawData = allPosts.slice(startIndex, endIndex);

    // LogListResponse 형태로 변환
    const paginatedData = rawData.map(post => ({
      id: post.id.toString(),
      seq: post.attributes.seq,
      date: post.attributes.date,
      uri: `/log${this.formatDatePath(post.attributes.date)}/${post.attributes.slug}`,
      title: post.attributes.title,
      content: post.attributes.content,
      linkPreviews: post.attributes.linkPreviews
    }));

    const pagination: StrapiPagination = {
      page,
      pageSize,
      pageCount: Math.ceil(allPosts.length / pageSize),
      total: allPosts.length
    };

    return {
      data: paginatedData,
      meta: { pagination }
    };
  }

  // About 데이터 로더
  static getAbout(): any {
    const aboutFile = path.join(POSTS_DIR, "about.md");
    if (!fs.existsSync(aboutFile)) return null;
    
    const fileContent = fs.readFileSync(aboutFile, "utf8");
    const { data: frontmatter, content } = matter(fileContent);
    
    return {
      data: {
        id: 1,
        attributes: {
          ...frontmatter,
          content: content.trim()
        }
      }
    };
  }

  static getMusings(): any {
    const musingsData = fs.readFileSync(path.join(process.cwd(), "data/musings.json"), "utf-8");
    return JSON.parse(musingsData);
  }

  // Prev/Next 헬퍼 함수들 (기존과 동일)
  static getLifePrevNext(slug: string): { prev: any | null, next: any | null } {
    const allArticles = this.getLifeArticles();
    const currentIndex = allArticles.findIndex(article => article.attributes.slug === slug);
    
    const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
    const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
    
    return {
      prev: prevArticle ? {
        id: prevArticle.id.toString(),
        date: prevArticle.attributes.date,
        title: prevArticle.attributes.title,
        uri: `/life${this.formatDatePath(prevArticle.attributes.date)}/${prevArticle.attributes.slug}`
      } : null,
      next: nextArticle ? {
        id: nextArticle.id.toString(),
        date: nextArticle.attributes.date,
        title: nextArticle.attributes.title,
        uri: `/life${this.formatDatePath(nextArticle.attributes.date)}/${nextArticle.attributes.slug}`
      } : null
    };
  }

  static getWorkPrevNext(slug: string): { prev: any | null, next: any | null } {
    const allArticles = this.getWorkArticles();
    const currentIndex = allArticles.findIndex(article => article.attributes.slug === slug);
    
    const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
    const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
    
    return {
      prev: prevArticle ? {
        id: prevArticle.id.toString(),
        date: prevArticle.attributes.date,
        title: prevArticle.attributes.title,
        uri: `/work${this.formatDatePath(prevArticle.attributes.date)}/${prevArticle.attributes.slug}`
      } : null,
      next: nextArticle ? {
        id: nextArticle.id.toString(),
        date: nextArticle.attributes.date,
        title: nextArticle.attributes.title,
        uri: `/work${this.formatDatePath(nextArticle.attributes.date)}/${nextArticle.attributes.slug}`
      } : null
    };
  }

  // Path 생성 헬퍼 (기존과 동일)
  static getAllLifePaths(): string[] {
    return this.getLifeArticles().map(article => article.attributes.slug);
  }

  static getAllWorkPaths(): string[] {
    return this.getWorkArticles().map(article => article.attributes.slug);
  }

  static getAllLogPaths(): string[] {
    return this.getLogPosts().map(post => post.attributes.slug);
  }

  // 날짜 포맷 헬퍼 (기존과 동일)
  private static formatDatePath(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `/${year}/${month}/${day}`;
  }
}
