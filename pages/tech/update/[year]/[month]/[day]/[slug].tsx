import * as React from "react";
import {TechArticleForm} from "src/tech/view/presentation/components/templates";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import useSWR, {SWRConfig} from "swr";
import {useRouter} from "next/router";
import {
  TechArticleDetailResponse,
  defaultTechArticleDetailResponseDto
} from "src/tech/domain/TechArticleDetailResponse";
import {container} from "src/config/inversify";
import {TechGetUseCase} from "src/tech/application/port/incoming/TechGetUseCase";
import {TechGetUseCaseId} from "src/tech/adapter/inversify";

const {getBySlug} = container.get<TechGetUseCase>(TechGetUseCaseId);

const getApiKey = (slug: string) => `@tech/${slug}`;

interface Props {
  fallback: {[x: string]: TechArticleDetailResponse}
}

const getSlug = (asPath: string): string => {
  const splitted = asPath.split("/");
  return splitted[6];
};

const TechUpdatePage = () => {
  const router = useRouter();
  const slug = getSlug(router.asPath);

  const res = useSWR<TechArticleDetailResponse>(getApiKey(slug), () => getBySlug(slug));
  const techDetail = res.data || defaultTechArticleDetailResponseDto;

  return <div>
    <TechArticleForm
      onSubmit={() => Promise.resolve()}
      isUpdating={true}
      initialValues={techDetail}
    />
  </div>;
};

const TechUpdatePageWrapper = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SWRConfig value={{fallback: props.fallback}}>
    <TechUpdatePage />
  </SWRConfig>;
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  // https://nodejs.org/api/http.html#messageurl
  const {pathname} = new URL(context.resolvedUrl || "", `https://${context.req.headers.host}`);
  const slug = getSlug(pathname);

  const props: TechArticleDetailResponse = await container.get<TechGetUseCase>(TechGetUseCaseId).getBySlug(slug);
  const key = getApiKey(slug);

  return {
    props: {
      fallback: {
        [key]: props
      }
    }
  };
};

export default TechUpdatePageWrapper;
