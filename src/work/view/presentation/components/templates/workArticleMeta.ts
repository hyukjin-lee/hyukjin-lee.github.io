export interface WorkArticleMeta {
  label: string;
}

export const workArticleTypeLabels: Record<string, string> = {
  qna: "Q&A",
  article: "Article",
  coach: "Coach",
};

export const workArticleTypeValues = Object.keys(workArticleTypeLabels);

export const getWorkArticleMeta = (workType?: string): WorkArticleMeta | null => {
  const label = workType ? workArticleTypeLabels[workType] : undefined;

  if (!label) return null;

  return {
    label,
  };
};
