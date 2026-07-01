import {WorkArticleStrapi} from "src/work/application/port/outgoing/WorkArticleStrapi";
import {StrapiResponse} from "../../../../common/domain/StrapiResponse";
import {WorkArticleListStrapi} from "src/work/application/port/outgoing/WorkArticleListStrapi";

export interface WorkLoadPort {
  getBySlug(slug: string): Promise<WorkArticleStrapi>
  findAll(page: number): Promise<StrapiResponse<WorkArticleListStrapi>>
}
