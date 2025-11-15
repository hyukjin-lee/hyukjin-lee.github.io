import * as React from "react";
import TechArticleList from "src/tech/view/presentation/components/templates/TechArticleList";
import {TechArticleListProps} from "src/tech/view/presentation/components/templates/TechArticleList/TechArticleList";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";
import {NextSeo} from "next-seo";
import {DEFAULT_LOCALE, Endpoints, SupportedLocale} from "src/common/constants/Constants";
import {buildCanonicalUrl, buildLanguageAlternatesForAllLocales} from "src/common/seo/seoUtils";

interface Props {
  techData: any;
  currentPage: number;
  currentLocale: SupportedLocale;
}

const TechArticleListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { techData, currentLocale } = props;
  const canonicalUrl = buildCanonicalUrl(currentLocale, Endpoints.tech);
  const languageAlternates = buildLanguageAlternatesForAllLocales(Endpoints.tech);

  const listProps: TechArticleListProps = {
    techArticles: techData.data || [],
    pagination: techData.meta.pagination,
  };

  return <div style={pageContainerStyle}>
    <NextSeo
      title="Tech"
      canonical={canonicalUrl}
      languageAlternates={languageAlternates}
    />
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

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
  const page = 1; // 첫 페이지만 정적 생성
  const currentLocale = (locale as SupportedLocale) || DEFAULT_LOCALE;
  const techData = StaticDataLoader.getTechArticlesPaginated(page, 10, currentLocale);

  return {
    props: {
      techData,
      currentLocale,
      currentPage: page
    }
  };
};

export default TechArticleListPage;
