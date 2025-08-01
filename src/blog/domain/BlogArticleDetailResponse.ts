export interface BlogArticlePrevOrNext {
  id: string;
  date: string;
  title: string;
  uri: string;
}

export interface BlogArticleDetailResponse {
  id: string;
  seq: number;
  date: string;
  updatedAt: string;
  title: string;
  slug: string;
  content: string;
  prev: BlogArticlePrevOrNext;
  next: BlogArticlePrevOrNext;
  linkPreviews?: Record<string, any>;
}

export const defaultBlogArticleDetailResponseDto: BlogArticleDetailResponse = {
  id: "",
  seq: -1,
  date: "",
  updatedAt: "",
  title: "",
  slug: "",
  content: "",
  prev: {
    id: "",
    date: "",
    title: "",
    uri: ""
  },
  next: {
    id: "",
    date: "",
    title: "",
    uri: ""
  },
};
