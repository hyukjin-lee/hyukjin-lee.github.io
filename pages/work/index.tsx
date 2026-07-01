import * as React from "react";
import WorkArticleList from "src/work/view/presentation/components/templates/WorkArticleList";
import {WorkArticleListProps} from "src/work/view/presentation/components/templates/WorkArticleList/WorkArticleList";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";

interface Props {
  workData: any;
  currentPage: number;
}

const WorkArticleListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { workData } = props;

  const listProps: WorkArticleListProps = {
    workArticles: workData.data || [],
    pagination: workData.meta.pagination,
  };

  return <div style={pageContainerStyle}>
    <div style={pageContainerStyle}>
      <HeadTitle title="Work" />
      <PageTitle title="articles" />
      <WorkArticleList {...listProps} />
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
  const workData = StaticDataLoader.getWorkArticlesPaginated(page);

  return {
    props: {
      workData,
      currentPage: page
    }
  };
};

export default WorkArticleListPage;
