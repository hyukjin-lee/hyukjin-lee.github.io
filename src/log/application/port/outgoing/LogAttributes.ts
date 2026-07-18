export interface LogAttributes {
  seq: number;
  date: string;
  updatedAt: string;
  slug: string;
  title?: string;
  content: string;
  linkPreviews?: Record<string, any>;
}
