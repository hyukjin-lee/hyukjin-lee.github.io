import {useTheme} from "@mui/material";
import * as React from "react";
import {HeadTitle} from "src/common/view/presentation/components/molecules";
import {Comment} from "src/common/view/presentation/components/organisms";
import DailyDetail from "src/daily/view/presentation/components/templates/DailyDetail";
import {GetStaticProps, GetStaticPaths, InferGetStaticPropsType} from "next";
import {DailyDetailResponse} from "src/daily/domain/DailyDetailResponse";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";

interface Props {
  dailyDetail: DailyDetailResponse;
}

const DailyDetailPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { dailyDetail } = props;
  const { seq } = dailyDetail;

  const theme = useTheme();
  return <div>
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

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = StaticDataLoader.getDailyPosts();
  
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
  
  const post = StaticDataLoader.getDailyPostBySlug(slug);
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

  return {
    props: {
      dailyDetail
    }
  };
};

export default DailyDetailPage;
