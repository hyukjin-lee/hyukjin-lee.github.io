import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import LegacyRedirect from "src/common/view/presentation/components/LegacyRedirect";
import { MarkdownDataLoader as StaticDataLoader } from "src/data/markdownDataLoader";

interface Props {
  target: string;
}

const LegacyWorkDetailPage = ({ target }: InferGetStaticPropsType<typeof getStaticProps>) => (
  <LegacyRedirect target={target} />
);

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
  const year = params?.year as string;
  const month = params?.month as string;
  const day = params?.day as string;
  const slug = params?.slug as string;

  return {
    props: {
      target: `/work/${year}/${month}/${day}/${slug}`
    }
  };
};

export default LegacyWorkDetailPage;
