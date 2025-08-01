import fs from "fs";
import path from "path";
import { BlogArticleListStrapi } from "../blog/application/port/outgoing/BlogArticleListStrapi";
import { BlogArticleStrapi } from "../blog/application/port/outgoing/BlogArticleStrapi";
import { TechArticleListStrapi } from "../tech/application/port/outgoing/TechArticleListStrapi";
import { TechArticleStrapi } from "../tech/application/port/outgoing/TechArticleStrapi";
import { DailyListStrapi } from "../daily/application/port/outgoing/DailyListStrapi";
import { DailyStrapi } from "../daily/application/port/outgoing/DailyStrapi";
import { MusingStrapi } from "../musing/application/port/outgoing/MusingStrapi";
import { StrapiResponse } from "../common/domain/StrapiResponse";
import { StrapiPagination } from "../common/domain/StrapiPagination";

const DATA_DIR = path.join(process.cwd(), "data");

export class StaticDataLoader {
  // Blog 데이터 로더
  static getBlogArticles(): BlogArticleListStrapi[] {
    const filePath = path.join(DATA_DIR, "blog-articles.json");
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  static getBlogArticleBySlug(slug: string): BlogArticleStrapi | null {
    const filePath = path.join(DATA_DIR, "blog", `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
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

  // Tech 데이터 로더
  static getTechArticles(): TechArticleListStrapi[] {
    const filePath = path.join(DATA_DIR, "tech-articles.json");
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  static getTechArticleBySlug(slug: string): TechArticleStrapi | null {
    const filePath = path.join(DATA_DIR, "tech", `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
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

  // Daily 데이터 로더
  static getDailyPosts(): DailyListStrapi[] {
    const filePath = path.join(DATA_DIR, "dailies.json");
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  static getDailyPostBySlug(slug: string): DailyStrapi | null {
    const filePath = path.join(DATA_DIR, "daily", `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
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
      content: post.attributes.content
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

  // Musings 데이터 로더
  static getMusings(): MusingStrapi[] {
    const filePath = path.join(DATA_DIR, "musings.json");
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  // About 데이터 로더
  static getAbout(): any {
    const filePath = path.join(DATA_DIR, "about.json");
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  // Prev/Next 헬퍼 함수들
  static getBlogPrevNext(seq: number): { prev: any | null, next: any | null } {
    const allArticles = this.getBlogArticles();
    const currentIndex = allArticles.findIndex(article => article.attributes.seq === seq);
    
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

  private static formatDatePath(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `/${year}/${month}/${day}`;
  }

  static getTechPrevNext(seq: number): { prev: any | null, next: any | null } {
    const allArticles = this.getTechArticles();
    const currentIndex = allArticles.findIndex(article => article.attributes.seq === seq);
    
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

  // Path 생성 헬퍼
  static getAllBlogPaths(): string[] {
    return this.getBlogArticles().map(article => article.attributes.slug);
  }

  static getAllTechPaths(): string[] {
    return this.getTechArticles().map(article => article.attributes.slug);
  }

  static getAllDailyPaths(): string[] {
    return this.getDailyPosts().map(post => post.attributes.slug);
  }
}