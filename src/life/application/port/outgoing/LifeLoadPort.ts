import {LifeArticleStrapi} from "src/life/application/port/outgoing/LifeArticleStrapi";
import {StrapiResponse} from "../../../../common/domain/StrapiResponse";
import {LifeArticleListStrapi} from "src/life/application/port/outgoing/LifeArticleListStrapi";

export interface LifeLoadPort {
  getBySlug(slug: string): Promise<LifeArticleStrapi>
  findAll(page: number): Promise<StrapiResponse<LifeArticleListStrapi>>
}
