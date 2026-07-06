import {NextSeo} from "next-seo";
import * as React from "react";
import {DOMAIN, Endpoints} from "src/common/constants/Constants";
import {Comment} from "src/common/view/presentation/components/organisms";
import {formatDateTime} from "src/util";
import {GetStaticProps, GetStaticPaths, InferGetStaticPropsType} from "next";
import {
  WorkArticleDetailResponse,
  WorkArticlePrevOrNext
} from "src/work/domain/WorkArticleDetailResponse";
import {WorkArticleDetail} from "src/work/view/presentation/components/templates";
import {useTheme} from "@mui/material";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";

interface Props {
  workArticle: WorkArticleDetailResponse;
  prev: any | null;
  next: any | null;
}

const WorkDetailPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { workArticle, prev, next } = props;
  const { title, content, date, slug } = workArticle;
  const subPath = `${formatDateTime(date, "/YYYY/MM/DD")}/${slug}`;

  const theme = useTheme();

  // prev/next 데이터는 이미 올바른 형태로 변환되어 전달됨
  const prevData: WorkArticlePrevOrNext = prev || { id: "", date: "", title: "", uri: "" };
  const nextData: WorkArticlePrevOrNext = next || { id: "", date: "", title: "", uri: "" };

  return <div>
    <NextSeo
      title={title}
      description={content.substring(0, 512)}
      canonical={`${DOMAIN}${Endpoints.work}${subPath}`}
    />

    <WorkArticleDetail
      workArticle={{...workArticle, prev: prevData, next: nextData}}
    />
    <div style={{ marginTop: "40px", padding: "20px 0" }}>
      <Comment identifier={`tech-${slug}`} />
    </div>
    {/* eslint-disable-next-line react/no-unknown-property */}
    <style jsx global>{`
#comment-container {
  max-width: ${theme.spacing(100)};
}
    `}</style>
  </div>;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = StaticDataLoader.getWorkArticles();
  
  const paths = articles.map((article) => {
    const date = new Date(article.attributes.date);
    return {
      params: {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString().padStart(2, "0"),
        day: date.getDate().toString().padStart(2, "0"),
        slug: article.attributes.slug
      }
    };
  });

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  
  const article = StaticDataLoader.getWorkArticleBySlug(slug);
  if (!article) {
    return { notFound: true };
  }

  // WorkArticleDetailResponse 형태로 변환
  const workArticle: WorkArticleDetailResponse = {
    id: article.id.toString(),
    seq: article.attributes.seq,
    title: article.attributes.title,
    workType: article.attributes.workType,
    content: article.attributes.content,
    date: article.attributes.date,
    slug: article.attributes.slug,
    updatedAt: article.attributes.updatedAt,
    prev: { id: "", date: "", title: "", uri: "" },
    next: { id: "", date: "", title: "", uri: "" },
    linkPreviews: article.attributes.linkPreviews
  };

  // prev/next 가져오기
  const { prev, next } = StaticDataLoader.getWorkPrevNext(article.attributes.slug);

  return {
    props: {
      workArticle,
      prev,
      next
    }
  };
};

export default WorkDetailPage;
