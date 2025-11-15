import * as React from "react";
import {HeadTitle, PageTitle} from "src/common/view/presentation/components/molecules";
import DailyList from "src/daily/view/presentation/components/templates/DailyList";
import {pageContainerStyle} from "src/common/view/presentation/styles/pageContainerStyle";
import MyPagination from "src/common/view/presentation/components/organisms/MyPagination";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {DailyListProps} from "src/daily/view/presentation/components/templates/DailyList/DailyList";
import {MarkdownDataLoader as StaticDataLoader} from "src/data/markdownDataLoader";
import {NextSeo} from "next-seo";
import {DEFAULT_LOCALE, Endpoints, SupportedLocale} from "src/common/constants/Constants";
import {buildCanonicalUrl, buildLanguageAlternatesForAllLocales} from "src/common/seo/seoUtils";

interface Props {
  dailyData: any;
  currentPage: number;
  currentLocale: SupportedLocale;
}

const DailyListPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { dailyData, currentLocale } = props;
  const canonicalUrl = buildCanonicalUrl(currentLocale, Endpoints.daily);
  const languageAlternates = buildLanguageAlternatesForAllLocales(Endpoints.daily);

  const listProps: DailyListProps = {
    dailys: dailyData.data || [],
  };
  const pagination = dailyData.meta.pagination;

  return <div style={pageContainerStyle}>
    <NextSeo
      title="Daily"
      canonical={canonicalUrl}
      languageAlternates={languageAlternates}
    />
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

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
  const page = 1; // 첫 페이지만 정적 생성
  const currentLocale = (locale as SupportedLocale) || DEFAULT_LOCALE;
  const dailyData = StaticDataLoader.getDailyPostsPaginated(page, 10, currentLocale);

  return {
    props: {
      dailyData,
      currentPage: page,
      currentLocale
    }
  };
};

export default DailyListPage;
