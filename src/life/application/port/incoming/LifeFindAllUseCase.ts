import {StrapiResponse} from "../../../../common/domain/StrapiResponse";
import {LifeArticleListResponse} from "../../../domain/LifeArticleListResponse";

export interface LifeFindAllUseCase {
  findAll(page: number): Promise<StrapiResponse<LifeArticleListResponse>>
}
