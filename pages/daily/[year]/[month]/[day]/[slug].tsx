import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import LegacyRedirect from "src/common/view/presentation/components/LegacyRedirect";
import { MarkdownDataLoader as StaticDataLoader } from "src/data/markdownDataLoader";

interface Props {
  target: string;
}

const LegacyDailyDetailPage = ({ target }: InferGetStaticPropsType<typeof getStaticProps>) => (
  <LegacyRedirect target={target} />
);

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
  const year = params?.year as string;
  const month = params?.month as string;
  const day = params?.day as string;
  const slug = params?.slug as string;

  return {
    props: {
      target: `/log/${year}/${month}/${day}/${slug}`
    }
  };
};

export default LegacyDailyDetailPage;
