import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogArticleListStrapi } from "../blog/application/port/outgoing/BlogArticleListStrapi";
import { BlogArticleStrapi } from "../blog/application/port/outgoing/BlogArticleStrapi";
import { TechArticleListStrapi } from "../tech/application/port/outgoing/TechArticleListStrapi";
import { TechArticleStrapi } from "../tech/application/port/outgoing/TechArticleStrapi";
import { DailyListStrapi } from "../daily/application/port/outgoing/DailyListStrapi";
import { DailyStrapi } from "../daily/application/port/outgoing/DailyStrapi";
import { StrapiResponse } from "../common/domain/StrapiResponse";
import { StrapiPagination } from "../common/domain/StrapiPagination";

const POSTS_DIR = path.join(process.cwd(), "_posts");
const LINK_PREVIEWS_FILE = path.join(process.cwd(), "data", "link-previews.json");

export class MarkdownDataLoader {
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
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    
    const result: Record<string, any> = {};
    urls.forEach(url => {
      if (linkPreviews[url]) {
        result[url] = linkPreviews[url];
      }
    });
    
    return result;
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
          date: frontmatter.date,
          updatedAt: frontmatter.updatedAt,
          slug: frontmatter.slug,
          title: frontmatter.title,
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

  // Blog 데이터 로더 (기존 인터페이스 유지)
  static getBlogArticles(): BlogArticleListStrapi[] {
    return this.readMarkdownFiles("blog");
  }

  static getBlogArticleBySlug(slug: string): BlogArticleStrapi | null {
    const files = fs.readdirSync(path.join(process.cwd(), "_posts/blog"));
    
    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(process.cwd(), "_posts/blog", file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);
        
        if (data.slug === slug) {
          return {
            id: data.id,
            attributes: {
              seq: data.seq,
              date: data.date,
              updatedAt: data.updatedAt,
              slug: data.slug,
              title: data.title,
              content: content,
              linkPreviews: this.getLinkPreviewsForContent(content)
            }
          };
        }
      }
    }
    
    return null;
  }

  static getBlogArticlesPaginated(page: number, pageSize = 10): StrapiResponse<any> {
    const allArticles = this.getBlogArticles();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rawData = allArticles.slice(startIndex, endIndex);

    // BlogArticleListResponse 형태로 변환
    const paginatedData = rawData.map(article => ({
      id: article.id.toString(),
      seq: article.attributes.seq,
      date: article.attributes.date,
      uri: `/blog${this.formatDatePath(article.attributes.date)}/${article.attributes.slug}`,
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

  // Tech 데이터 로더 (기존 인터페이스 유지)
  static getTechArticles(): TechArticleListStrapi[] {
    return this.readMarkdownFiles("tech");
  }

  static getTechArticleBySlug(slug: string): TechArticleStrapi | null {
    const files = fs.readdirSync(path.join(process.cwd(), "_posts/tech"));
    
    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(process.cwd(), "_posts/tech", file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);
        
        if (data.slug === slug) {
          return {
            id: data.id,
            attributes: {
              seq: data.seq,
              date: data.date,
              updatedAt: data.updatedAt,
              slug: data.slug,
              title: data.title,
              content: content,
              linkPreviews: this.getLinkPreviewsForContent(content)
            }
          };
        }
      }
    }
    
    return null;
  }

  static getTechArticlesPaginated(page: number, pageSize = 10): StrapiResponse<any> {
    const allArticles = this.getTechArticles();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rawData = allArticles.slice(startIndex, endIndex);

    // TechArticleListResponse 형태로 변환
    const paginatedData = rawData.map(article => ({
      id: article.id.toString(),
      seq: article.attributes.seq,
      date: article.attributes.date,
      uri: `/tech${this.formatDatePath(article.attributes.date)}/${article.attributes.slug}`,
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

  // Daily 데이터 로더 (기존 인터페이스 유지)
  static getDailyPosts(): DailyListStrapi[] {
    return this.readMarkdownFiles("daily");
  }

  static getDailyPostBySlug(slug: string): DailyStrapi | null {
    const files = fs.readdirSync(path.join(process.cwd(), "_posts/daily"));
    
    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(process.cwd(), "_posts/daily", file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);
        
        if (data.slug === slug) {
          return {
            id: data.id,
            attributes: {
              seq: data.seq,
              date: data.date,
              updatedAt: data.updatedAt,
              slug: data.slug,
              title: data.title,
              content: content,
              linkPreviews: this.getLinkPreviewsForContent(content)
            }
          };
        }
      }
    }
    
    return null;
  }

  static getDailyPostsPaginated(page: number, pageSize = 10): StrapiResponse<any> {
    const allPosts = this.getDailyPosts();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rawData = allPosts.slice(startIndex, endIndex);

    // DailyListResponse 형태로 변환
    const paginatedData = rawData.map(post => ({
      id: post.id.toString(),
      seq: post.attributes.seq,
      date: post.attributes.date,
      uri: `/daily${this.formatDatePath(post.attributes.date)}/${post.attributes.slug}`,
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
  static getBlogPrevNext(slug: string): { prev: any | null, next: any | null } {
    const allArticles = this.getBlogArticles();
    const currentIndex = allArticles.findIndex(article => article.attributes.slug === slug);
    
    const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
    const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
    
    return {
      prev: prevArticle ? {
        id: prevArticle.id.toString(),
        date: prevArticle.attributes.date,
        title: prevArticle.attributes.title,
        uri: `/blog${this.formatDatePath(prevArticle.attributes.date)}/${prevArticle.attributes.slug}`
      } : null,
      next: nextArticle ? {
        id: nextArticle.id.toString(),
        date: nextArticle.attributes.date,
        title: nextArticle.attributes.title,
        uri: `/blog${this.formatDatePath(nextArticle.attributes.date)}/${nextArticle.attributes.slug}`
      } : null
    };
  }

  static getTechPrevNext(slug: string): { prev: any | null, next: any | null } {
    const allArticles = this.getTechArticles();
    const currentIndex = allArticles.findIndex(article => article.attributes.slug === slug);
    
    const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
    const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
    
    return {
      prev: prevArticle ? {
        id: prevArticle.id.toString(),
        date: prevArticle.attributes.date,
        title: prevArticle.attributes.title,
        uri: `/tech${this.formatDatePath(prevArticle.attributes.date)}/${prevArticle.attributes.slug}`
      } : null,
      next: nextArticle ? {
        id: nextArticle.id.toString(),
        date: nextArticle.attributes.date,
        title: nextArticle.attributes.title,
        uri: `/tech${this.formatDatePath(nextArticle.attributes.date)}/${nextArticle.attributes.slug}`
      } : null
    };
  }

  // Path 생성 헬퍼 (기존과 동일)
  static getAllBlogPaths(): string[] {
    return this.getBlogArticles().map(article => article.attributes.slug);
  }

  static getAllTechPaths(): string[] {
    return this.getTechArticles().map(article => article.attributes.slug);
  }

  static getAllDailyPaths(): string[] {
    return this.getDailyPosts().map(post => post.attributes.slug);
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