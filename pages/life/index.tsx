import * as React from "react";
import BlogArticleList from "src/blog/view/presentation/components/templates/BlogArticleList";
import {BlogArticleListProps} from "src/blog/view/presentation/components/templates/BlogArticleList/BlogArticleList";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";

interface Props {
  blogData: any;
  currentPage: number;
}

const BlogArticleListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { blogData } = props;

  const listProps: BlogArticleListProps = {
    blogArticles: blogData.data || [],
    pagination: blogData.meta.pagination,
  };

  return <div style={pageContainerStyle}>
    <div style={pageContainerStyle}>
      <HeadTitle title="Life" />
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

export const getStaticProps: GetStaticProps<Props> = async () => {
  const page = 1; // 첫 페이지만 정적 생성
  const blogData = StaticDataLoader.getBlogArticlesPaginated(page);

  return {
    props: {
      blogData,
      currentPage: page
    }
  };
};

export default BlogArticleListPage;
