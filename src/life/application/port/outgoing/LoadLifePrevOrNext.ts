import {LifeArticleListStrapi} from "src/life/application/port/outgoing/LifeArticleListStrapi";

export interface LifeLoadPrevOrNextPort {
  getPrevOf(seq: number): Promise<LifeArticleListStrapi>
  getNextOf(seq: number): Promise<LifeArticleListStrapi>
}
