import * as React from "react";
import AboutComponent from "src/about/view/presentation/components/templates/About";
import {HeadTitle} from "src/common/view/presentation/components/molecules";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import {About} from "src/about/domain/About";
import {container} from "src/config/inversify";
import {AboutGetUseCase} from "src/about/application/port/incoming/AboutGetUseCase";
import {AboutGetUseCaseId} from "src/about/adapter/inversify";
import {NextSeo} from "next-seo";
import {buildCanonicalUrl, buildLanguageAlternatesForAllLocales} from "src/common/seo/seoUtils";
import {DEFAULT_LOCALE, Endpoints, SupportedLocale} from "src/common/constants/Constants";

interface Props {
  about: About;
  currentLocale: SupportedLocale;
}

const AboutPage = ({about, currentLocale}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const canonicalUrl = buildCanonicalUrl(currentLocale, Endpoints.about);
  const languageAlternates = buildLanguageAlternatesForAllLocales(Endpoints.about);

  return <div>
    <NextSeo
      title="About"
      canonical={canonicalUrl}
      languageAlternates={languageAlternates}
    />
    <HeadTitle title="About" />
    <AboutComponent about={about} />
  </div>;
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

export default AboutPage;
