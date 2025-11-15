import {NextSeo} from "next-seo";
import * as React from "react";
import {DEFAULT_LOCALE, Endpoints, SupportedLocale} from "src/common/constants/Constants";
import {Comment} from "src/common/view/presentation/components/organisms";
import {formatDateTime} from "src/util";
import {GetStaticProps, GetStaticPaths, InferGetStaticPropsType} from "next";
import {
  TechArticleDetailResponse,
  TechArticlePrevOrNext
} from "src/tech/domain/TechArticleDetailResponse";
import {TechArticleDetail} from "src/tech/view/presentation/components/templates";
import {useTheme} from "@mui/material";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";
import {buildCanonicalUrl, localeUrisToLanguageAlternates} from "src/common/seo/seoUtils";
import type { LocaleUri } from "src/data/markdownDataLoader";

interface Props {
  techArticle: TechArticleDetailResponse;
  prev: any | null;
  next: any | null;
  alternates: LocaleUri[];
  currentLocale: SupportedLocale;
}

const TechDetailPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { techArticle, prev, next, alternates, currentLocale } = props;
  const { title, content, date, slug, seq } = techArticle;
  const subPath = `${formatDateTime(date, "/YYYY/MM/DD")}/${slug}`;
  const canonicalPath = `${Endpoints.tech}${subPath}`;
  const canonicalUrl = buildCanonicalUrl(currentLocale, canonicalPath);

  const theme = useTheme();

  // prev/next 데이터는 이미 올바른 형태로 변환되어 전달됨
  const prevData: TechArticlePrevOrNext = prev || { id: "", date: "", title: "", uri: "" };
  const nextData: TechArticlePrevOrNext = next || { id: "", date: "", title: "", uri: "" };

  return <div>
    <NextSeo
      title={title}
      description={content.substring(0, 512)}
      canonical={canonicalUrl}
      languageAlternates={localeUrisToLanguageAlternates(alternates)}
    />

    <TechArticleDetail
      techArticle={{...techArticle, prev: prevData, next: nextData}}
    />
    <div style={{ marginTop: "40px", padding: "20px 0" }}>
      <Comment identifier={`tech-${seq}`} />
    </div>
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
    const articles = StaticDataLoader.getTechArticles(locale);
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

  const article = StaticDataLoader.getTechArticleBySlug(slug, currentLocale);
  if (!article) {
    return { notFound: true };
  }

  // TechArticleDetailResponse 형태로 변환
  const techArticle: TechArticleDetailResponse = {
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
  const { prev, next } = StaticDataLoader.getTechPrevNext(article.attributes.seq, currentLocale);
  const alternates = StaticDataLoader.getTechAlternates(slug);

  return {
    props: {
      techArticle,
      prev,
      next,
      alternates,
      currentLocale
    }
  };
};

export default TechDetailPage;
