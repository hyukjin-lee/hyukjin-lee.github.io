import {useTheme} from "@mui/material";
import * as React from "react";
import {HeadTitle} from "src/common/view/presentation/components/molecules";
import {Comment} from "src/common/view/presentation/components/organisms";
import DailyDetail from "src/daily/view/presentation/components/templates/DailyDetail";
import {GetStaticProps, GetStaticPaths, InferGetStaticPropsType} from "next";
import {DailyDetailResponse} from "src/daily/domain/DailyDetailResponse";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";
import {NextSeo} from "next-seo";
import {DEFAULT_LOCALE, Endpoints, SupportedLocale} from "src/common/constants/Constants";
import {formatDateTime} from "src/util";
import {buildCanonicalUrl, localeUrisToLanguageAlternates} from "src/common/seo/seoUtils";
import type { LocaleUri } from "src/data/markdownDataLoader";

interface Props {
  dailyDetail: DailyDetailResponse;
  alternates: LocaleUri[];
  currentLocale: SupportedLocale;
}

const DailyDetailPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { dailyDetail, alternates, currentLocale } = props;
  const { seq, slug, date, content, title } = dailyDetail;
  const subPath = `${formatDateTime(date, "/YYYY/MM/DD")}/${slug}`;
  const canonicalPath = `${Endpoints.daily}${subPath}`;
  const canonicalUrl = buildCanonicalUrl(currentLocale, canonicalPath);
  const cleanDescription = content
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim()
    .substring(0, 160);

  const theme = useTheme();
  return <div>
    <NextSeo
      title={title}
      description={cleanDescription}
      canonical={canonicalUrl}
      languageAlternates={localeUrisToLanguageAlternates(alternates)}
    />
    <HeadTitle title="Daily" />
    <DailyDetail daily={dailyDetail} />
    <Comment identifier={`daily-${seq}`} />
    {/* eslint-disable-next-line react/no-unknown-property */}
    <style jsx global>{`
#comment-container {
  max-width: ${theme.spacing(62.5)};
}
    `}</style>
  </div>;
};

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths = [];
  const localeList = locales ?? [];
  for (const locale of localeList) {
    const posts = StaticDataLoader.getDailyPosts(locale);
    for (const post of posts) {
      const date = new Date(post.attributes.date);
      paths.push({
        params: {
          year: date.getFullYear().toString(),
          month: (date.getMonth() + 1).toString().padStart(2, "0"),
          day: date.getDate().toString().padStart(2, "0"),
          slug: post.attributes.slug
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

  const post = StaticDataLoader.getDailyPostBySlug(slug, currentLocale);
  if (!post) {
    return { notFound: true };
  }

  // DailyDetailResponse 형태로 변환
  const dailyDetail: DailyDetailResponse = {
    id: post.id.toString(),
    seq: post.attributes.seq,
    title: post.attributes.title,
    content: post.attributes.content,
    date: post.attributes.date,
    slug: post.attributes.slug,
    updatedAt: post.attributes.updatedAt,
    linkPreviews: post.attributes.linkPreviews
  };

  const alternates = StaticDataLoader.getDailyAlternates(slug);

  return {
    props: {
      dailyDetail,
      alternates,
      currentLocale
    }
  };
};

export default DailyDetailPage;
