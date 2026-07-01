import {useTheme} from "@mui/material";
import * as React from "react";
import {HeadTitle} from "src/common/view/presentation/components/molecules";
import {Comment} from "src/common/view/presentation/components/organisms";
import LogDetail from "src/log/view/presentation/components/templates/LogDetail";
import {GetStaticProps, GetStaticPaths, InferGetStaticPropsType} from "next";
import {LogDetailResponse} from "src/log/domain/LogDetailResponse";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";

interface Props {
  logDetail: LogDetailResponse;
}

const LogDetailPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { logDetail } = props;
  const { slug } = logDetail;

  const theme = useTheme();
  return <div>
    <HeadTitle title="Log" />
    <LogDetail log={logDetail} />
    <Comment identifier={`daily-${slug}`} />
    {/* eslint-disable-next-line react/no-unknown-property */}
    <style jsx global>{`
#comment-container {
  max-width: ${theme.spacing(62.5)};
}
    `}</style>
  </div>;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = StaticDataLoader.getLogPosts();
  
  const paths = posts.map((post) => {
    const date = new Date(post.attributes.date);
    return {
      params: {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString().padStart(2, "0"),
        day: date.getDate().toString().padStart(2, "0"),
        slug: post.attributes.slug
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
  
  const post = StaticDataLoader.getLogPostBySlug(slug);
  if (!post) {
    return { notFound: true };
  }

  // LogDetailResponse 형태로 변환
  const logDetail: LogDetailResponse = {
    id: post.id.toString(),
    seq: post.attributes.seq,
    title: post.attributes.title,
    content: post.attributes.content,
    date: post.attributes.date,
    slug: post.attributes.slug,
    updatedAt: post.attributes.updatedAt,
    linkPreviews: post.attributes.linkPreviews
  };

  return {
    props: {
      logDetail
    }
  };
};

export default LogDetailPage;
