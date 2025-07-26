import {NextSeo} from "next-seo";
import * as React from "react";
import {DOMAIN, Endpoints} from "src/common/constants/Constants";
import {Comment} from "src/common/view/presentation/components/organisms";
import {formatDateTime} from "src/util";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import useSWR, {SWRConfig} from "swr";
import {useRouter} from "next/router";
import {
  TechArticleDetailResponse,
  TechArticlePrevOrNext,
  defaultTechArticleDetailResponseDto
} from "src/tech/domain/TechArticleDetailResponse";
import {TechArticleDetail} from "src/tech/view/presentation/components/templates";
import {useTheme} from "@mui/material";
import {container} from "src/config/inversify";
import {TechGetUseCase} from "src/tech/application/port/incoming/TechGetUseCase";
import {TechGetPrevOrNextUseCase} from "src/tech/application/port/incoming/TechGetPrevOrNextUseCase";
import {TechGetPrevOrNextUseCaseId, TechGetUseCaseId} from "src/tech/adapter/inversify";

const {getBySlug} = container.get<TechGetUseCase>(TechGetUseCaseId);
const {getPrevOf, getNextOf} = container.get<TechGetPrevOrNextUseCase>(TechGetPrevOrNextUseCaseId);

const getApiKey = (slug: string) => `@tech/${slug}`;
const getPrevApiKey = (seq: number) => `@techPrev/${seq}`;
const getNextApiKey = (seq: number) => `@techNext/${seq}`;

const useFetchToGetPrevAndNextWhenArticleIsLoadedBySSR = (article: TechArticleDetailResponse): {
  prev: TechArticlePrevOrNext
  next: TechArticlePrevOrNext
} => {
  const {seq} = article;
  const defaultData = {
    id: "",
    date: "",
    title: "",
    uri: ""
  };

  const prevResponse = useSWR<TechArticlePrevOrNext>(getPrevApiKey(seq), () => getPrevOf(seq));
  const nextResponse = useSWR<TechArticlePrevOrNext>(getNextApiKey(seq), () => getNextOf(seq));

  return {
    prev: prevResponse.data || defaultData,
    next: nextResponse.data || defaultData
  };
};

interface Props {
  fallback: {[x: string]: TechArticleDetailResponse}
}

const TechDetailPage = () => {
  const router = useRouter();
  const slugFromPath = getSlug(router.asPath);

  const res = useSWR<TechArticleDetailResponse>(getApiKey(slugFromPath), () => getBySlug(slugFromPath));
  const techDetail = res.data || defaultTechArticleDetailResponseDto;

  const {prev, next} = useFetchToGetPrevAndNextWhenArticleIsLoadedBySSR(techDetail);

  const { title, content, date, slug } = techDetail;
  const subPath = `${formatDateTime(date, "/YYYY/MM/DD")}/${slug}`;

  const theme = useTheme();

  return <div>
    <NextSeo
      title={title}
      description={content.substring(0, 512)}
      canonical={`${DOMAIN}${Endpoints.tech}${subPath}`}
    />

    <TechArticleDetail
      techArticle={{...techDetail, prev, next}}
    />
    <Comment identifier={`tech${subPath}`} />
    {/* eslint-disable-next-line react/no-unknown-property */}
    <style jsx global>{`
#comment-container {
  max-width: ${theme.spacing(100)};
}
    `}</style>
  </div>;
};

const TechDetailPageWrapper = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SWRConfig value={{fallback: props.fallback}}>
    <TechDetailPage />
  </SWRConfig>;
};

const getSlug = (asPath: string): string => {
  const split = asPath.split("/");
  return decodeURIComponent(split[5]);
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  // https://nodejs.org/api/http.html#messageurl
  const {pathname} = new URL(context.resolvedUrl || "", `https://${context.req.headers.host}`);
  const slug = getSlug(pathname);

  const props: TechArticleDetailResponse = await getBySlug(slug);
  const key = getApiKey(slug);

  return {
    props: {
      fallback: {
        [key]: props
      }
    }
  };
};

export default TechDetailPageWrapper;
