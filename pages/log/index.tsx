import * as React from "react";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import LogList from "src/log/view/presentation/components/templates/LogList";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {LogListProps} from "src/log/view/presentation/components/templates/LogList/LogList";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";
import {LogListResponse} from "src/log/domain/LogListResponse";

const LOG_PAGE_SIZE = 10;

interface Props {
  logs: LogListResponse[];
}

const LogListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { logs } = props;
  const [visibleCount, setVisibleCount] = React.useState(LOG_PAGE_SIZE);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const currentLogs = logs.slice(0, visibleCount);
  const hasMore = visibleCount < logs.length;

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      setVisibleCount((count) => Math.min(count + LOG_PAGE_SIZE, logs.length));
    }, { rootMargin: "240px 0px" });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, logs.length]);

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
    {hasMore && <div ref={sentinelRef} style={{height: 1}} />}
  </div>;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const page = 1; // 첫 페이지만 정적 생성
  const logData = StaticDataLoader.getLogPostsPaginated(page, Number.MAX_SAFE_INTEGER);

  return {
    props: {
      logs: logData.data
    }
  };
};

export default LogListPage;
