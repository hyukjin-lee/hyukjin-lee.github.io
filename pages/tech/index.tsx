import * as React from "react";
import TechArticleList from "src/tech/view/presentation/components/templates/TechArticleList";
import {TechArticleListProps} from "src/tech/view/presentation/components/templates/TechArticleList/TechArticleList";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {strapiPaginationDefault} from "src/common/domain/StrapiPagination";
import useSWR, {SWRConfig} from "swr";
import {StrapiResponse} from "src/common/domain/StrapiResponse";
import {useRouter} from "next/router";
import {TechArticleListResponse} from "src/tech/domain/TechArticleListResponse";
import {container} from "src/config/inversify";
import {TechFindAllUseCase} from "src/tech/application/port/incoming/TechFindAllUseCase";
import {TechFindAllUseCaseId} from "src/tech/adapter/inversify";

const {findAll} = container.get<TechFindAllUseCase>(TechFindAllUseCaseId);

interface Props {
  fallback: {[x: string]: StrapiResponse<TechArticleListResponse>}
}

const getApiKey = (page: number) => `@techArticleList/PAGE_${page}`;

const TechArticleListPage = () => {
  const router = useRouter();
  const pageNumber = parseInt("" + router.query["page"]) || 1;

  const res = useSWR<StrapiResponse<TechArticleListResponse>>(getApiKey(pageNumber), () => findAll(pageNumber));

  const listProps: TechArticleListProps = {
    techArticles: res.data?.data || [],
    pagination: res.data?.meta.pagination || strapiPaginationDefault,
  };

  return <div style={pageContainerStyle}>
    <div style={pageContainerStyle}>
      <HeadTitle title="Tech" />
      <PageTitle title="articles" />
      <TechArticleList {...listProps} />
      <div /> {/* Loading 컴포넌트를 가운데로 맞추기 위한 empty div */}
    </div>
    <div style={{display: "flex", justifyContent: "center"}}>
      <div>
        <MyPagination pagination={listProps.pagination} />
      </div>
    </div>
  </div>;
};

const TechArticleListPageWrapper = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SWRConfig value={{fallback: props.fallback}}>
    <TechArticleListPage />
  </SWRConfig>;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const page = 1;

  const props = await findAll(page);
  const key = getApiKey(page);

  return {
    props: {
      fallback: {
        [key]: props
      }
    }
  };
};

export default TechArticleListPageWrapper;
