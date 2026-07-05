export interface WorkArticleMeta {
  label: string;
  color: string;
}

const topicLabels: Record<string, string> = {
  ai: "AI",
  engineering: "Engineering",
  career: "Career",
};

const typeLabels: Record<string, string> = {
  "deep-dive": "Deep Dive",
  essay: "Essay",
  guide: "Guide",
  explainer: "Explainer",
  qna: "Q&A",
  coach: "Coach",
};

const topicColors: Record<string, string> = {
  ai: "#3B82F6",
  engineering: "#14B8A6",
  career: "#F59E0B",
};

export const getWorkArticleMeta = (
  workTopic?: string,
  workType?: string
): WorkArticleMeta | null => {
  const topicLabel = workTopic ? topicLabels[workTopic] : undefined;
  const typeLabel = workType ? typeLabels[workType] : undefined;
  const labels = [topicLabel, typeLabel].filter(Boolean);

  if (labels.length === 0) return null;

  return {
    label: labels.join(" · "),
    color: workTopic ? topicColors[workTopic] ?? "#8A8A8A" : "#8A8A8A",
  };
};
