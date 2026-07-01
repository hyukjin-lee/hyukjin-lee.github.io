import {WorkArticlePrevOrNext} from "../../../domain/WorkArticleDetailResponse";

export interface WorkGetPrevOrNextUseCase {
  getPrevOf(seq: number): Promise<WorkArticlePrevOrNext>
  getNextOf(seq: number): Promise<WorkArticlePrevOrNext>
}
