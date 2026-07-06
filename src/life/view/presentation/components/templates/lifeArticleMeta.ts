export interface LifeArticleMeta {
  label: string;
}

export const lifeArticleTypeLabels: Record<string, string> = {
  travelogue: "여행기",
  blog: "블로그",
  thought: "생각",
};

export const lifeArticleTypeValues = Object.keys(lifeArticleTypeLabels);

export const getLifeArticleMeta = (lifeType?: string): LifeArticleMeta | null => {
  const label = lifeType ? lifeArticleTypeLabels[lifeType] : undefined;

  if (!label) return null;

  return {
    label,
  };
};
