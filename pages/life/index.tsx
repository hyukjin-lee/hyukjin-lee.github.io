import * as React from "react";
import LifeArticleList from "src/life/view/presentation/components/templates/LifeArticleList";
import {LifeArticleListProps} from "src/life/view/presentation/components/templates/LifeArticleList/LifeArticleList";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";

interface Props {
  lifeData: any;
  currentPage: number;
}

const LifeArticleListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { lifeData } = props;

  const listProps: LifeArticleListProps = {
    lifeArticles: lifeData.data || [],
    pagination: lifeData.meta.pagination,
  };

  return <div style={pageContainerStyle}>
    <div style={pageContainerStyle}>
      <HeadTitle title="Life" />
      <PageTitle title="articles" />
      <LifeArticleList {...listProps} />
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
  const lifeData = StaticDataLoader.getLifeArticlesPaginated(page);

  return {
    props: {
      lifeData,
      currentPage: page
    }
  };
};

export default LifeArticleListPage;
