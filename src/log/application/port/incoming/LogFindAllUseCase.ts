import {StrapiResponse} from "../../../../common/domain/StrapiResponse";
import {LogListResponse} from "../../../domain/LogListResponse";

export interface LogFindAllUseCase {
  findAll(page: number): Promise<StrapiResponse<LogListResponse>>
}
