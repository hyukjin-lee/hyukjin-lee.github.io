import {LogDetailResponse} from "../../../domain/LogDetailResponse";

export interface LogGetUseCase {
  getBySlug(slug: string): Promise<LogDetailResponse>
}
