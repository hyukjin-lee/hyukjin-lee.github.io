import {StrapiResponse} from "../../../../common/domain/StrapiResponse";
import {LogStrapi} from "./LogStrapi";
import {LogListStrapi} from "./LogListStrapi";

export interface LogLoadPort {
  getBySlug(slug: string): Promise<LogStrapi>
  findAll(page: number): Promise<StrapiResponse<LogListStrapi>>
}
