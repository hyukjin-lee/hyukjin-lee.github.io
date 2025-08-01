export interface DailyListResponse {
  id: string;
  seq: number;
  date: string;
  uri: string;
  title: string;
  content: string;
  linkPreviews?: Record<string, any>;
}
