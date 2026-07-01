import {StrapiResponse} from "../../../../common/domain/StrapiResponse";
import {WorkArticleListResponse} from "../../../domain/WorkArticleListResponse";

export interface WorkFindAllUseCase {
  findAll(page: number): Promise<StrapiResponse<WorkArticleListResponse>>
}
