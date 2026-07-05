export interface WorkArticleListResponse {
  id: string;
  seq: number;
  date: string;
  uri: string;
  title: string;
  workTopic?: string;
  workType?: string;
}
