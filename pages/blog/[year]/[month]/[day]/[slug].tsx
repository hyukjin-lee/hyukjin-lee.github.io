import {NextSeo} from "next-seo";
import * as React from "react";
import {DEFAULT_LOCALE, Endpoints, SupportedLocale} from "src/common/constants/Constants";
import {Comment} from "src/common/view/presentation/components/organisms";
import {formatDateTime} from "src/util";
import {GetStaticProps, GetStaticPaths, InferGetStaticPropsType} from "next";
import {
  BlogArticleDetailResponse,
  BlogArticlePrevOrNext
} from "src/blog/domain/BlogArticleDetailResponse";
import {BlogArticleDetail} from "src/blog/view/presentation/components/templates";
import {useTheme} from "@mui/material";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";
import {localeUrisToLanguageAlternates, buildCanonicalUrl} from "src/common/seo/seoUtils";
import type { LocaleUri } from "src/data/markdownDataLoader";

interface Props {
  blogArticle: BlogArticleDetailResponse;
  prev: any | null;
  next: any | null;
  alternates: LocaleUri[];
  currentLocale: SupportedLocale;
}

const BlogDetailPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { blogArticle, prev, next, alternates, currentLocale } = props;
  const { title, content, date, slug, seq } = blogArticle;
  const subPath = `${formatDateTime(date, "/YYYY/MM/DD")}/${slug}`;
  const canonicalPath = `${Endpoints.blog}${subPath}`;
  const canonicalUrl = buildCanonicalUrl(currentLocale, canonicalPath);

  const theme = useTheme();

  // prev/next 데이터는 이미 올바른 형태로 변환되어 전달됨
  const prevData: BlogArticlePrevOrNext = prev || { id: "", date: "", title: "", uri: "" };
  const nextData: BlogArticlePrevOrNext = next || { id: "", date: "", title: "", uri: "" };

  // 더 나은 description 생성 (마크다운 제거)
  const cleanDescription = content
    .replace(/#{1,6}\s+/g, "") // 헤더 제거
    .replace(/\*\*(.*?)\*\*/g, "$1") // 볼드 제거
    .replace(/\*(.*?)\*/g, "$1") // 이탤릭 제거
    .replace(/`(.*?)`/g, "$1") // 코드 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 링크 제거
    .replace(/\n+/g, " ") // 줄바꿈을 공백으로
    .trim()
    .substring(0, 160); // Google 권장 길이

  const publishedTime = new Date(date).toISOString();
  const modifiedTime = new Date(blogArticle.updatedAt || date).toISOString();

  return <div>
    <NextSeo
      title={title}
      description={cleanDescription}
      canonical={canonicalUrl}
      languageAlternates={localeUrisToLanguageAlternates(alternates)}
      openGraph={{
        type: "article",
        title: title,
        description: cleanDescription,
        url: canonicalUrl,
        article: {
          publishedTime: publishedTime,
          modifiedTime: modifiedTime,
          authors: ["https://github.com/hyukhyukk"],
          tags: ["블로그", "기술", "개발"],
        },
        images: [{
          url: "https://s.gravatar.com/avatar/afe249c2d2c2c95d078179a42a940c42?s=400",
          width: 400,
          height: 400,
          alt: title,
        }],
      }}
      twitter={{
        cardType: "summary_large_image",
      }}
      additionalMetaTags={[
        {
          name: "keywords",
          content: "개발, 프로그래밍, 기술블로그, 소프트웨어"
        },
        {
          name: "author",
          content: "이혁진"
        },
        {
          property: "article:author",
          content: "이혁진"
        },
        {
          property: "article:published_time",
          content: publishedTime
        },
        {
          property: "article:modified_time",
          content: modifiedTime
        }
      ]}
    />

    <BlogArticleDetail
      blogArticle={{...blogArticle, prev: prevData, next: nextData}}
    />
    <Comment identifier={`blog-${seq}`} />
    {/* eslint-disable-next-line react/no-unknown-property */}
    <style jsx global>{`
#comment-container {
  max-width: ${theme.spacing(100)};
}
    `}</style>
  </div>;
};

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths = [];
  const localeList = locales ?? [];
  for (const locale of localeList) {
    const articles = StaticDataLoader.getBlogArticles(locale);
    for (const article of articles) {
      const date = new Date(article.attributes.date);
      paths.push({
        params: {
          year: date.getFullYear().toString(),
          month: (date.getMonth() + 1).toString().padStart(2, "0"),
          day: date.getDate().toString().padStart(2, "0"),
          slug: article.attributes.slug
        },
        locale
      });
    }
  }

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const slug = params?.slug as string;
  const currentLocale = (locale as SupportedLocale) || DEFAULT_LOCALE;
  
  const article = StaticDataLoader.getBlogArticleBySlug(slug, currentLocale);
  if (!article) {
    return { notFound: true };
  }

  // BlogArticleDetailResponse 형태로 변환
  const blogArticle: BlogArticleDetailResponse = {
    id: article.id.toString(),
    seq: article.attributes.seq,
    title: article.attributes.title,
    content: article.attributes.content,
    date: article.attributes.date,
    slug: article.attributes.slug,
    updatedAt: article.attributes.updatedAt,
    prev: { id: "", date: "", title: "", uri: "" },
    next: { id: "", date: "", title: "", uri: "" },
    linkPreviews: article.attributes.linkPreviews
  };

  // prev/next 가져오기
  const { prev, next } = StaticDataLoader.getBlogPrevNext(article.attributes.seq, currentLocale);
  const alternates = StaticDataLoader.getBlogAlternates(slug);

  return {
    props: {
      blogArticle,
      prev,
      next,
      alternates,
      currentLocale
    }
  };
};

export default BlogDetailPage;
