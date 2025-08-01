export interface TechArticlePrevOrNext {
  id: string;
  date: string;
  title: string;
  uri: string;
}

export interface TechArticleDetailResponse {
  id: string;
  seq: number;
  date: string;
  updatedAt: string;
  title: string;
  slug: string;
  content: string;
  prev: TechArticlePrevOrNext;
  next: TechArticlePrevOrNext;
  linkPreviews?: Record<string, any>;
}

export const defaultTechArticleDetailResponseDto: TechArticleDetailResponse = {
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
