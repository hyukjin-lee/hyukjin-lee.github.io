import {WorkAttributes} from "./WorkAttributes";

export interface WorkArticleListStrapi {
  id: number;
  attributes: Omit<WorkAttributes, "content">
}

