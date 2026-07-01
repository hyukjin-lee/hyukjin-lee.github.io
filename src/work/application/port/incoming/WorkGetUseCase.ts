import {WorkArticleDetailResponse} from "../../../domain/WorkArticleDetailResponse";

export interface WorkGetUseCase {
  getBySlug(slug: string): Promise<WorkArticleDetailResponse>
}
