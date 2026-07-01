export interface WorkArticlePrevOrNext {
  id: string;
  date: string;
  title: string;
  uri: string;
}

export interface WorkArticleDetailResponse {
  id: string;
  seq: number;
  date: string;
  updatedAt: string;
  title: string;
  slug: string;
  content: string;
  prev: WorkArticlePrevOrNext;
  next: WorkArticlePrevOrNext;
  linkPreviews?: Record<string, any>;
}

export const defaultWorkArticleDetailResponseDto: WorkArticleDetailResponse = {
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
