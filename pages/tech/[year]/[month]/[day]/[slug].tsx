import {NextSeo} from "next-seo";
import * as React from "react";
import {DOMAIN, Endpoints} from "src/common/constants/Constants";
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

interface Props {
  techArticle: TechArticleDetailResponse;
  prev: any | null;
  next: any | null;
}

const TechDetailPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { techArticle, prev, next } = props;
  const { title, content, date, slug } = techArticle;
  const subPath = `${formatDateTime(date, "/YYYY/MM/DD")}/${slug}`;

  const theme = useTheme();

  // prev/next 데이터는 이미 올바른 형태로 변환되어 전달됨
  const prevData: TechArticlePrevOrNext = prev || { id: "", date: "", title: "", uri: "" };
  const nextData: TechArticlePrevOrNext = next || { id: "", date: "", title: "", uri: "" };

  return <div>
    <NextSeo
      title={title}
      description={content.substring(0, 512)}
      canonical={`${DOMAIN}${Endpoints.tech}${subPath}`}
    />

    <TechArticleDetail
      techArticle={{...techArticle, prev: prevData, next: nextData}}
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
  const articles = StaticDataLoader.getTechArticles();
  
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
  
  const article = StaticDataLoader.getTechArticleBySlug(slug);
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
    next: { id: "", date: "", title: "", uri: "" }
  };

  // prev/next 가져오기
  const { prev, next } = StaticDataLoader.getTechPrevNext(article.attributes.seq);

  return {
    props: {
      techArticle,
      prev,
      next
    }
  };
};

export default TechDetailPage;
