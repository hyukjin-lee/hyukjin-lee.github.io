export interface LifeArticlePrevOrNext {
  id: string;
  date: string;
  title: string;
  uri: string;
}

export interface LifeArticleDetailResponse {
  id: string;
  seq: number;
  date: string;
  updatedAt: string;
  title: string;
  lifeType?: string;
  slug: string;
  content: string;
  prev: LifeArticlePrevOrNext;
  next: LifeArticlePrevOrNext;
  linkPreviews?: Record<string, any>;
}

export const defaultLifeArticleDetailResponseDto: LifeArticleDetailResponse = {
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
