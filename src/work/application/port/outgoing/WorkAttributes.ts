export interface WorkAttributes {
  seq: number;
  date: string;
  updatedAt: string;
  slug: string;
  title: string;
  workType?: string;
  content: string;
  linkPreviews?: Record<string, any>;
}
