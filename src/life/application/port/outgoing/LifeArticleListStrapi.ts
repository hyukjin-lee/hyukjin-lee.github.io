import {LifeAttributes} from "./LifeAttributes";

export interface LifeArticleListStrapi {
  id: number;
  attributes: Omit<LifeAttributes, "content">
}

