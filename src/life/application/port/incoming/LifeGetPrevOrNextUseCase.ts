import {LifeArticlePrevOrNext} from "../../../domain/LifeArticleDetailResponse";

export interface LifeGetPrevOrNextUseCase {
  getPrevOf(seq: number): Promise<LifeArticlePrevOrNext>
  getNextOf(seq: number): Promise<LifeArticlePrevOrNext>
}
