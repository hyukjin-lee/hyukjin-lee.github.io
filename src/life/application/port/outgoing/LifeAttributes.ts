export interface LifeAttributes {
  seq: number;
  date: string;
  updatedAt: string;
  slug: string;
  title: string;
  lifeType?: string;
  content: string;
  linkPreviews?: Record<string, any>;
}
