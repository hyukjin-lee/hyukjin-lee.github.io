export interface LogListResponse {
  id: string;
  seq: number;
  date: string;
  uri: string;
  title: string;
  content: string;
  linkPreviews?: Record<string, any>;
}
