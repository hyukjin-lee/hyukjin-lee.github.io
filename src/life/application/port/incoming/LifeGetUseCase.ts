import {LifeArticleDetailResponse} from "../../../domain/LifeArticleDetailResponse";

export interface LifeGetUseCase {
  getBySlug(slug: string): Promise<LifeArticleDetailResponse>
}
