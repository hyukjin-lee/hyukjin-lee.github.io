import React from "react";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {About} from "../src/about/domain/About";
import {container} from "src/config/inversify";
import {AboutGetUseCase} from "src/about/application/port/incoming/AboutGetUseCase";
import {AboutGetUseCaseId} from "src/about/adapter/inversify";
import {NextSeo} from "next-seo";
import {buildCanonicalUrl, buildLanguageAlternatesForAllLocales} from "src/common/seo/seoUtils";
import {DEFAULT_LOCALE, SupportedLocale} from "src/common/constants/Constants";
import AboutComponent from "src/about/view/presentation/components/templates/About";
import {HeadTitle} from "src/common/view/presentation/components/molecules";

interface Props {
  about: About;
  currentLocale: SupportedLocale;
}

const MainPage = ({about, currentLocale}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const canonicalUrl = buildCanonicalUrl(currentLocale, "/");
  const languageAlternates = buildLanguageAlternatesForAllLocales("/");

  return <>
    <NextSeo
      title="About"
      canonical={canonicalUrl}
      languageAlternates={languageAlternates}
    />
    <HeadTitle title="About" />
    <AboutComponent about={about} />
  </>;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
  const about = await container.get<AboutGetUseCase>(AboutGetUseCaseId).get();
  const currentLocale = (locale as SupportedLocale) || DEFAULT_LOCALE;

  return {
    props: {
      about,
      currentLocale
    }
  };
};

export default MainPage;
