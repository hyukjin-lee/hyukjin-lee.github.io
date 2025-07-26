import {NextSeo} from "next-seo";
import * as React from "react";
import {DOMAIN, Endpoints} from "src/common/constants/Constants";
import {Comment} from "src/common/view/presentation/components/organisms";
import {formatDateTime} from "src/util";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import useSWR, {SWRConfig} from "swr";
import {useRouter} from "next/router";
import {
  BlogArticleDetailResponse,
  BlogArticlePrevOrNext,
  defaultBlogArticleDetailResponseDto
} from "src/blog/domain/BlogArticleDetailResponse";
import {BlogArticleDetail} from "src/blog/view/presentation/components/templates";
import {useTheme} from "@mui/material";
import {container} from "src/config/inversify";
import {BlogGetUseCase} from "src/blog/application/port/incoming/BlogGetUseCase";
import {BlogGetPrevOrNextUseCase} from "src/blog/application/port/incoming/BlogGetPrevOrNextUseCase";
import {BlogGetPrevOrNextUseCaseId, BlogGetUseCaseId} from "src/blog/adapter/inversify";

const {getBySlug} = container.get<BlogGetUseCase>(BlogGetUseCaseId);
const {getPrevOf, getNextOf} = container.get<BlogGetPrevOrNextUseCase>(BlogGetPrevOrNextUseCaseId);

const getApiKey = (slug: string) => `@blog/${slug}`;
const getPrevApiKey = (seq: number) => `@blogPrev/${seq}`;
const getNextApiKey = (seq: number) => `@blogNext/${seq}`;

const useFetchToGetPrevAndNextWhenArticleIsLoadedBySSR = (article: BlogArticleDetailResponse): {
  prev: BlogArticlePrevOrNext
  next: BlogArticlePrevOrNext
} => {
  const {seq} = article;
  const defaultData = {
    id: "",
    date: "",
    title: "",
    uri: ""
  };

  const prevResponse = useSWR<BlogArticlePrevOrNext>(getPrevApiKey(seq), () => getPrevOf(seq));
  const nextResponse = useSWR<BlogArticlePrevOrNext>(getNextApiKey(seq), () => getNextOf(seq));

  return {
    prev: prevResponse.data || defaultData,
    next: nextResponse.data || defaultData
  };
};

interface Props {
  fallback: {[x: string]: BlogArticleDetailResponse}
}

const BlogDetailPage = () => {
  const router = useRouter();
  const slugFromPath = getSlug(router.asPath);

  const res = useSWR<BlogArticleDetailResponse>(getApiKey(slugFromPath), () => getBySlug(slugFromPath));
  const blogDetail = res.data || defaultBlogArticleDetailResponseDto;

  const {prev, next} = useFetchToGetPrevAndNextWhenArticleIsLoadedBySSR(blogDetail);

  const { title, content, date, slug } = blogDetail;
  const subPath = `${formatDateTime(date, "/YYYY/MM/DD")}/${slug}`;

  const theme = useTheme();

  return <div>
    <NextSeo
      title={title}
      description={content.substring(0, 512)}
      canonical={`${DOMAIN}${Endpoints.blog}${subPath}`}
    />

    <BlogArticleDetail
      blogArticle={{...blogDetail, prev, next}}
    />
    <Comment identifier={`blog${subPath}`} />
    {/* eslint-disable-next-line react/no-unknown-property */}
    <style jsx global>{`
#comment-container {
  max-width: ${theme.spacing(100)};
}
    `}</style>
  </div>;
};

const BlogDetailPageWrapper = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SWRConfig value={{fallback: props.fallback}}>
    <BlogDetailPage />
  </SWRConfig>;
};

const getSlug = (asPath: string): string => {
  const split = asPath.split("/");
  return decodeURIComponent(split[5]);
};

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
  const slug = decodeURIComponent(params?.slug as string);

  const props: BlogArticleDetailResponse = await getBySlug(slug);
  const key = getApiKey(slug);

  return {
    props: {
      fallback: {
        [key]: props
      }
    }
  };
};

export default BlogDetailPageWrapper;
