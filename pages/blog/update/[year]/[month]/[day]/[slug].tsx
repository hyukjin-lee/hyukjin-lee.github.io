import * as React from "react";
import {BlogArticleForm} from "src/blog/view/presentation/components/templates";
import {GetStaticProps, InferGetStaticPropsType} from "next";
import useSWR, {SWRConfig} from "swr";
import {useRouter} from "next/router";
import {
  BlogArticleDetailResponse,
  defaultBlogArticleDetailResponseDto
} from "src/blog/domain/BlogArticleDetailResponse";
import {container} from "src/config/inversify";
import {BlogGetUseCase} from "src/blog/application/port/incoming/BlogGetUseCase";
import {BlogGetUseCaseId} from "src/blog/adapter/inversify";

const {getBySlug} = container.get<BlogGetUseCase>(BlogGetUseCaseId);

const getApiKey = (slug: string) => `@blog/${slug}`;

interface Props {
  fallback: {[x: string]: BlogArticleDetailResponse}
}

const getSlug = (asPath: string): string => {
  const splitted = asPath.split("/");
  return splitted[6];
};

const BlogUpdatePage = () => {
  const router = useRouter();
  const slug = getSlug(router.asPath);

  const res = useSWR<BlogArticleDetailResponse>(getApiKey(slug), () => getBySlug(slug));
  const blogDetail = res.data || defaultBlogArticleDetailResponseDto;

  return <div>
    <BlogArticleForm
      onSubmit={() => Promise.resolve()}
      isUpdating={true}
      initialValues={blogDetail}
    />
  </div>;
};

const BlogUpdatePageWrapper = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SWRConfig value={{fallback: props.fallback}}>
    <BlogUpdatePage />
  </SWRConfig>;
};

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
  const slug = decodeURIComponent(params?.slug as string);

  const props: BlogArticleDetailResponse = await container.get<BlogGetUseCase>(BlogGetUseCaseId).getBySlug(slug);
  const key = getApiKey(slug);

  return {
    props: {
      fallback: {
        [key]: props
      }
    }
  };
};

export default BlogUpdatePageWrapper;
