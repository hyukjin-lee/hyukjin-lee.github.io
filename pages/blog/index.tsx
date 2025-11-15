import * as React from "react";
import BlogArticleList from "src/blog/view/presentation/components/templates/BlogArticleList";
import {BlogArticleListProps} from "src/blog/view/presentation/components/templates/BlogArticleList/BlogArticleList";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";
import {NextSeo} from "next-seo";
import {DEFAULT_LOCALE, Endpoints, SupportedLocale} from "src/common/constants/Constants";
import {buildCanonicalUrl, buildLanguageAlternatesForAllLocales} from "src/common/seo/seoUtils";

interface Props {
  blogData: any;
  currentPage: number;
  currentLocale: SupportedLocale;
}

const BlogArticleListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { blogData, currentLocale } = props;
  const canonicalUrl = buildCanonicalUrl(currentLocale, Endpoints.blog);
  const languageAlternates = buildLanguageAlternatesForAllLocales(Endpoints.blog);

  const listProps: BlogArticleListProps = {
    blogArticles: blogData.data || [],
    pagination: blogData.meta.pagination,
  };

  return <div style={pageContainerStyle}>
    <NextSeo
      title="Blog"
      canonical={canonicalUrl}
      languageAlternates={languageAlternates}
    />
    <div style={pageContainerStyle}>
      <HeadTitle title="Blog" />
      <PageTitle title="articles" />
      <BlogArticleList {...listProps} />
      <div /> {/* Loading 컴포넌트를 가운데로 맞추기 위한 empty div */}
    </div>
    <div style={{display: "flex", justifyContent: "center"}}>
      <div>
        <MyPagination pagination={listProps.pagination} />
      </div>
    </div>
  </div>;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
  const page = 1; // 첫 페이지만 정적 생성
  const currentLocale = (locale as SupportedLocale) || DEFAULT_LOCALE;
  const blogData = StaticDataLoader.getBlogArticlesPaginated(page, 10, currentLocale);

  return {
    props: {
      blogData,
      currentPage: page,
      currentLocale
    }
  };
};

export default BlogArticleListPage;
