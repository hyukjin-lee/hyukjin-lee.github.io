import * as React from "react";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import LogList from "src/log/view/presentation/components/templates/LogList";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {LogListProps} from "src/log/view/presentation/components/templates/LogList/LogList";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";

interface Props {
  logData: any;
  currentPage: number;
}

const LogListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { logData } = props;

  const listProps: LogListProps = {
    logs: logData.data || [],
  };
  const pagination = logData.meta.pagination;

  return <div style={pageContainerStyle}>
    <div style={pageContainerStyle}>
      <HeadTitle title="Log" />
      <PageTitle title="log" />
      <LogList {...listProps} />
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
  const logData = StaticDataLoader.getLogPostsPaginated(page);

  return {
    props: {
      logData,
      currentPage: page
    }
  };
};

export default LogListPage;
