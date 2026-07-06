import * as React from "react";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import LogList from "src/log/view/presentation/components/templates/LogList";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {useRouter} from "next/router";
import {LogListProps} from "src/log/view/presentation/components/templates/LogList/LogList";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";
import {LogListResponse} from "src/log/domain/LogListResponse";
import {StrapiPagination} from "src/common/domain/StrapiPagination";

const LOG_PAGE_SIZE = 10;

interface Props {
  logs: LogListResponse[];
  pagination: StrapiPagination;
  currentPage: number;
}

const parsePage = (value: string | string[] | undefined): number => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue ?? 1);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

const clampPage = (page: number, pageCount: number): number =>
  Math.min(Math.max(page, 1), Math.max(pageCount, 1));

const LogListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { logs, pagination } = props;
  const router = useRouter();
  const pageCount = Math.ceil(logs.length / LOG_PAGE_SIZE);
  const currentPage = clampPage(parsePage(router.query.page), pageCount);
  const startIndex = (currentPage - 1) * LOG_PAGE_SIZE;
  const currentLogs = logs.slice(startIndex, startIndex + LOG_PAGE_SIZE);
  const currentPagination: StrapiPagination = {
    ...pagination,
    page: currentPage,
    pageSize: LOG_PAGE_SIZE,
    pageCount,
    total: logs.length,
  };

  const listProps: LogListProps = {
    logs: currentLogs,
  };

  return <div style={pageContainerStyle}>
    <div style={pageContainerStyle}>
      <HeadTitle title="Log" />
      <PageTitle title="log" />
      <LogList {...listProps} />
      <div /> {/* Loading 컴포넌트를 가운데로 맞추기 위한 empty div */}
    </div>
    <div style={{display: "flex", justifyContent: "center"}}>
      <div>
        <MyPagination pagination={currentPagination} />
      </div>
    </div>
  </div>;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const page = 1; // 첫 페이지만 정적 생성
  const logData = StaticDataLoader.getLogPostsPaginated(page, Number.MAX_SAFE_INTEGER);
  const pagination: StrapiPagination = {
    page,
    pageSize: LOG_PAGE_SIZE,
    pageCount: Math.ceil(logData.data.length / LOG_PAGE_SIZE),
    total: logData.data.length,
  };

  return {
    props: {
      logs: logData.data,
      pagination,
      currentPage: page
    }
  };
};

export default LogListPage;
