import * as React from "react";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import DailyList from "src/daily/view/presentation/components/templates/DailyList";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {DailyListProps} from "src/daily/view/presentation/components/templates/DailyList/DailyList";
import {StaticDataLoader} from "src/data/staticDataLoader";

interface Props {
  dailyData: any;
  currentPage: number;
}

const DailyListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { dailyData } = props;

  const listProps: DailyListProps = {
    dailys: dailyData.data || [],
  };
  const pagination = dailyData.meta.pagination;

  return <div style={pageContainerStyle}>
    <div style={pageContainerStyle}>
      <HeadTitle title="Daily" />
      <PageTitle title="daily" />
      <DailyList {...listProps} />
      <div /> {/* Loading 컴포넌트를 가운데로 맞추기 위한 empty div */}
    </div>
    <div style={{display: "flex", justifyContent: "center"}}>
      <div>
        <MyPagination pagination={pagination} />
      </div>
    </div>
  </div>;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const page = 1; // 첫 페이지만 정적 생성
  const dailyData = StaticDataLoader.getDailyPostsPaginated(page);

  return {
    props: {
      dailyData,
      currentPage: page
    }
  };
};

export default DailyListPage;
