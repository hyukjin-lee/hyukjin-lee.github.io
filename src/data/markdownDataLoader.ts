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
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from "../common/constants/Constants";

const LINK_PREVIEWS_FILE = path.join(process.cwd(), "data", "link-previews.json");
const SUPPORTED_LOCALE_SET: SupportedLocale[] = [...SUPPORTED_LOCALES];

export interface LocaleUri {
  locale: SupportedLocale;
  uri: string;
}

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
  private static normalizeLocale(locale?: string): SupportedLocale {
    if (!locale) {
      return DEFAULT_LOCALE;
    }
    return (SUPPORTED_LOCALES.find((supported) => supported === locale) ?? DEFAULT_LOCALE) as SupportedLocale;
  }

  private static readMarkdownFiles(category: string, locale: string): any[] {
    const normalizedLocale = this.normalizeLocale(locale);
    let categoryDir = path.join(process.cwd(), `_posts/${normalizedLocale}`, category);
    
    if (!fs.existsSync(categoryDir)) {
      if (normalizedLocale !== DEFAULT_LOCALE) { // 기본 로케일로 폴백
        categoryDir = path.join(process.cwd(), `_posts/${DEFAULT_LOCALE}`, category);
        if (!fs.existsSync(categoryDir)) return [];
      } else {
        return [];
      }
    }

    const files = fs.readdirSync(categoryDir).filter(file => file.endsWith(".md"));
    
    return files.map(filename => {
      const filePath = path.join(categoryDir, filename);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data: frontmatter, content } = matter(fileContent);
      
      return {
        id: frontmatter.id || 1,
        attributes: {
          seq: frontmatter.seq || 1,
          date: frontmatter.date,
          updatedAt: frontmatter.updatedAt,
          slug: frontmatter.slug,
          title: frontmatter.title,
          content: content.trim(),
          linkPreviews: this.getLinkPreviewsForContent(content.trim())
        }
      };
    }).sort((a, b) => b.attributes.seq - a.attributes.seq);
  }
  
  private static findArticleBySlug(slug: string, category: string, locale: string): any | null {
    const categoryDir = path.join(process.cwd(), `_posts/${locale}`, category);
    if (!fs.existsSync(categoryDir)) return null;

    const files = fs.readdirSync(categoryDir);
    
    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(categoryDir, file);
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

  // Blog 데이터 로더
  static getBlogArticles(locale: string): BlogArticleListStrapi[] {
    return this.readMarkdownFiles("blog", locale);
  }

  static getBlogArticleBySlug(slug: string, locale: string): BlogArticleStrapi | null {
    const normalizedLocale = this.normalizeLocale(locale);
    let article = this.findArticleBySlug(slug, "blog", normalizedLocale);
    if (!article && normalizedLocale !== DEFAULT_LOCALE) {
      article = this.findArticleBySlug(slug, "blog", DEFAULT_LOCALE);
    }
    return article;
  }

  static getBlogArticlesPaginated(page: number, pageSize = 10, locale: string): StrapiResponse<any> {
    const normalizedLocale = this.normalizeLocale(locale);
    const allArticles = this.getBlogArticles(normalizedLocale);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rawData = allArticles.slice(startIndex, endIndex);

    const paginatedData = rawData.map(article => ({
      id: article.id.toString(),
      seq: article.attributes.seq,
      date: article.attributes.date,
      uri: this.buildDetailUri("blog", normalizedLocale, article.attributes.date, article.attributes.slug),
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

  // Tech 데이터 로더
  static getTechArticles(locale: string): TechArticleListStrapi[] {
    return this.readMarkdownFiles("tech", locale);
  }

  static getTechArticleBySlug(slug: string, locale: string): TechArticleStrapi | null {
    const normalizedLocale = this.normalizeLocale(locale);
    let article = this.findArticleBySlug(slug, "tech", normalizedLocale);
    if (!article && normalizedLocale !== DEFAULT_LOCALE) {
      article = this.findArticleBySlug(slug, "tech", DEFAULT_LOCALE);
    }
    return article;
  }

  static getTechArticlesPaginated(page: number, pageSize = 10, locale: string): StrapiResponse<any> {
    const normalizedLocale = this.normalizeLocale(locale);
    const allArticles = this.getTechArticles(normalizedLocale);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rawData = allArticles.slice(startIndex, endIndex);

    const paginatedData = rawData.map(article => ({
      id: article.id.toString(),
      seq: article.attributes.seq,
      date: article.attributes.date,
      uri: this.buildDetailUri("tech", normalizedLocale, article.attributes.date, article.attributes.slug),
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

  // Daily 데이터 로더
  static getDailyPosts(locale: string): DailyListStrapi[] {
    return this.readMarkdownFiles("daily", locale);
  }

  static getDailyPostBySlug(slug: string, locale: string): DailyStrapi | null {
    const normalizedLocale = this.normalizeLocale(locale);
    let post = this.findArticleBySlug(slug, "daily", normalizedLocale);
    if (!post && normalizedLocale !== DEFAULT_LOCALE) {
      post = this.findArticleBySlug(slug, "daily", DEFAULT_LOCALE);
    }
    return post;
  }

  static getDailyPostsPaginated(page: number, pageSize = 10, locale: string): StrapiResponse<any> {
    const normalizedLocale = this.normalizeLocale(locale);
    const allPosts = this.getDailyPosts(normalizedLocale);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rawData = allPosts.slice(startIndex, endIndex);

    const paginatedData = rawData.map(post => ({
      id: post.id.toString(),
      seq: post.attributes.seq,
      date: post.attributes.date,
      uri: this.buildDetailUri("daily", normalizedLocale, post.attributes.date, post.attributes.slug),
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

  // About 데이터 로더 (About는 다국어 지원에서 제외)
  static getAbout(): any {
    // ... 기존 구현 유지 ...
    return {};
  }

  static getMusings(): any {
    const musingsData = fs.readFileSync(path.join(process.cwd(), "data/musings.json"), "utf-8");
    return JSON.parse(musingsData);
  }

  // Prev/Next 헬퍼 함수들
  static getBlogPrevNext(seq: number, locale: string): { prev: any | null, next: any | null } {
    const normalizedLocale = this.normalizeLocale(locale);
    const allArticles = this.getBlogArticles(normalizedLocale);
    const currentIndex = allArticles.findIndex(article => article.attributes.seq === seq);
    
    const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
    const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
    
    return {
      prev: prevArticle ? {
        id: prevArticle.id.toString(),
        date: prevArticle.attributes.date,
        title: prevArticle.attributes.title,
        uri: this.buildDetailUri("blog", normalizedLocale, prevArticle.attributes.date, prevArticle.attributes.slug)
      } : null,
      next: nextArticle ? {
        id: nextArticle.id.toString(),
        date: nextArticle.attributes.date,
        title: nextArticle.attributes.title,
        uri: this.buildDetailUri("blog", normalizedLocale, nextArticle.attributes.date, nextArticle.attributes.slug)
      } : null
    };
  }

  static getTechPrevNext(seq: number, locale: string): { prev: any | null, next: any | null } {
    const normalizedLocale = this.normalizeLocale(locale);
    const allArticles = this.getTechArticles(normalizedLocale);
    const currentIndex = allArticles.findIndex(article => article.attributes.seq === seq);
    
    const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
    const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
    
    return {
      prev: prevArticle ? {
        id: prevArticle.id.toString(),
        date: prevArticle.attributes.date,
        title: prevArticle.attributes.title,
        uri: this.buildDetailUri("tech", normalizedLocale, prevArticle.attributes.date, prevArticle.attributes.slug)
      } : null,
      next: nextArticle ? {
        id: nextArticle.id.toString(),
        date: nextArticle.attributes.date,
        title: nextArticle.attributes.title,
        uri: this.buildDetailUri("tech", normalizedLocale, nextArticle.attributes.date, nextArticle.attributes.slug)
      } : null
    };
  }

  // Path 생성 헬퍼
  static getAllBlogPaths(locale: string): { params: { slug: string }, locale: string }[] {
    const normalizedLocale = this.normalizeLocale(locale);
    return this.getBlogArticles(normalizedLocale).map(article => ({
      params: { slug: article.attributes.slug },
      locale: normalizedLocale,
    }));
  }

  static getAllTechPaths(locale: string): { params: { slug: string }, locale: string }[] {
    const normalizedLocale = this.normalizeLocale(locale);
    return this.getTechArticles(normalizedLocale).map(article => ({
      params: { slug: article.attributes.slug },
      locale: normalizedLocale,
    }));
  }

  static getAllDailyPaths(locale: string): { params: { slug: string }, locale: string }[] {
    const normalizedLocale = this.normalizeLocale(locale);
    return this.getDailyPosts(normalizedLocale).map(post => ({
      params: { slug: post.attributes.slug },
      locale: normalizedLocale,
    }));
  }

  private static formatFullDatePath(dateString: string): string {
    if (!dateString) return "/";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `/${year}/${month}/${day}`;
  }

  private static getLocalePrefix(locale: SupportedLocale): string {
    return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  }

  private static buildDetailUri(category: string, locale: SupportedLocale, date: string, slug: string): string {
    const prefix = this.getLocalePrefix(locale);
    return `${prefix}/${category}${this.formatFullDatePath(date)}/${slug}`.replace(/\/{2,}/g, "/");
  }

  private static getAlternates(category: string, slug: string): LocaleUri[] {
    return SUPPORTED_LOCALE_SET.map((locale) => {
      const article = this.findArticleBySlug(slug, category, locale);
      if (!article) {
        return null;
      }

      return {
        locale,
        uri: this.buildDetailUri(category, locale, article.attributes.date, article.attributes.slug),
      };
    }).filter((item): item is LocaleUri => item !== null);
  }

  static getBlogAlternates(slug: string): LocaleUri[] {
    return this.getAlternates("blog", slug);
  }

  static getTechAlternates(slug: string): LocaleUri[] {
    return this.getAlternates("tech", slug);
  }

  static getDailyAlternates(slug: string): LocaleUri[] {
    return this.getAlternates("daily", slug);
  }
}
