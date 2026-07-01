import {WorkArticleListStrapi} from "src/work/application/port/outgoing/WorkArticleListStrapi";

export interface WorkLoadPrevOrNextPort {
  getPrevOf(seq: number): Promise<WorkArticleListStrapi>
  getNextOf(seq: number): Promise<WorkArticleListStrapi>
}
