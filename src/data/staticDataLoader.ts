import fs from "fs";
import path from "path";
import { LifeArticleListStrapi } from "../life/application/port/outgoing/LifeArticleListStrapi";
import { LifeArticleStrapi } from "../life/application/port/outgoing/LifeArticleStrapi";
import { WorkArticleListStrapi } from "../work/application/port/outgoing/WorkArticleListStrapi";
import { WorkArticleStrapi } from "../work/application/port/outgoing/WorkArticleStrapi";
import { LogListStrapi } from "../log/application/port/outgoing/LogListStrapi";
import { LogStrapi } from "../log/application/port/outgoing/LogStrapi";
import { MusingStrapi } from "../musing/application/port/outgoing/MusingStrapi";
import { StrapiResponse } from "../common/domain/StrapiResponse";
import { StrapiPagination } from "../common/domain/StrapiPagination";

const DATA_DIR = path.join(process.cwd(), "data");

export class StaticDataLoader {
  // Life 데이터 로더
  static getLifeArticles(): LifeArticleListStrapi[] {
    const filePath = path.join(DATA_DIR, "blog-articles.json");
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  static getLifeArticleBySlug(slug: string): LifeArticleStrapi | null {
    const filePath = path.join(DATA_DIR, "life", `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
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
      title: article.attributes.title,
      lifeType: article.attributes.lifeType
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

  // Work 데이터 로더
  static getWorkArticles(): WorkArticleListStrapi[] {
    const filePath = path.join(DATA_DIR, "tech-articles.json");
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  static getWorkArticleBySlug(slug: string): WorkArticleStrapi | null {
    const filePath = path.join(DATA_DIR, "work", `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
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

  // Log 데이터 로더
  static getLogPosts(): LogListStrapi[] {
    const filePath = path.join(DATA_DIR, "dailies.json");
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  static getLogPostBySlug(slug: string): LogStrapi | null {
    const filePath = path.join(DATA_DIR, "log", `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
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
  static getLifePrevNext(seq: number): { prev: any | null, next: any | null } {
    const allArticles = this.getLifeArticles();
    const currentIndex = allArticles.findIndex(article => article.attributes.seq === seq);
    
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

  private static formatDatePath(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `/${year}/${month}/${day}`;
  }

  static getWorkPrevNext(seq: number): { prev: any | null, next: any | null } {
    const allArticles = this.getWorkArticles();
    const currentIndex = allArticles.findIndex(article => article.attributes.seq === seq);
    
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

  // Path 생성 헬퍼
  static getAllLifePaths(): string[] {
    return this.getLifeArticles().map(article => article.attributes.slug);
  }

  static getAllWorkPaths(): string[] {
    return this.getWorkArticles().map(article => article.attributes.slug);
  }

  static getAllLogPaths(): string[] {
    return this.getLogPosts().map(post => post.attributes.slug);
  }
}
