export interface DailyDetailResponse {
  id: string;
  seq: number;
  date: string;
  updatedAt: string;
  title: string;
  slug: string;
  content: string;
  linkPreviews?: Record<string, any>;
}

export const defaultDailyDetailResponseDto: DailyDetailResponse = {
  id: "",
  seq: -1,
  date: "",
  updatedAt: "",
  title: "",
  slug: "",
  content: ""
};
