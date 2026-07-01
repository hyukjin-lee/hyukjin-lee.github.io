import {LifeFindAllUseCase} from "./port/incoming/LifeFindAllUseCase";
import {LifeGetUseCase} from "./port/incoming/LifeGetUseCase";
import {LifeGetPrevOrNextUseCase} from "./port/incoming/LifeGetPrevOrNextUseCase";
import {StrapiResponse} from "../../common/domain/StrapiResponse";
import {LifeLoadPort} from "./port/outgoing/LifeLoadPort";
import {LifeLoadPrevOrNextPort} from "./port/outgoing/LoadLifePrevOrNext";
import {LifeArticle} from "../domain";
import {LifeArticleDetailResponse, LifeArticlePrevOrNext} from "../domain/LifeArticleDetailResponse";
import {LifeArticleListResponse} from "../domain/LifeArticleListResponse";
import {LifeArticleListStrapi} from "./port/outgoing/LifeArticleListStrapi";

export class LifeService implements LifeFindAllUseCase, LifeGetUseCase, LifeGetPrevOrNextUseCase{

  private readonly defaultPrevOrNext: LifeArticlePrevOrNext = {
    id: "",
    date: "",
    title: "",
    uri: "",
  };

  constructor(
    private readonly loadLifePort: LifeLoadPort,
    private readonly loadLifePrevOrNextPort: LifeLoadPrevOrNextPort
  ) { }

  public getBySlug = (slug: string): Promise<LifeArticleDetailResponse> =>
    this.loadLifePort.getBySlug(slug)
      .then(it => ({
        id: "" + it.id,
        seq: it.attributes.seq,
        date: it.attributes.date,
        updatedAt: it.attributes.updatedAt,
        title: it.attributes.title,
        slug: it.attributes.slug,
        content: it.attributes.content,
        prev: this.defaultPrevOrNext,
        next: this.defaultPrevOrNext
      }));

  public findAll = (page: number): Promise<StrapiResponse<LifeArticleListResponse>> =>
    this.loadLifePort.findAll(page)
      .then(data => ({
        data: data.data.map(it => ({
          id: "" + it.id,
          seq: it.attributes.seq,
          date: it.attributes.date,
          uri: LifeArticle.createUri({date: it.attributes.date, slug: it.attributes.slug}),
          title: it.attributes.title,
        })),
        meta: data.meta,
      }));

  public getPrevOf = (seq: number): Promise<LifeArticlePrevOrNext> =>
    this.loadLifePrevOrNextPort.getPrevOf(seq).then(this.convertListToPrevOrNext);

  public getNextOf = (seq: number): Promise<LifeArticlePrevOrNext> =>
    this.loadLifePrevOrNextPort.getNextOf(seq).then(this.convertListToPrevOrNext);

  private convertListToPrevOrNext = (list: LifeArticleListStrapi): LifeArticlePrevOrNext =>
    ({
      id: "" + list.id,
      date: list.attributes.date,
      title: list.attributes.title,
      uri: LifeArticle.createUri({date: list.attributes.date, slug: list.attributes.slug}),
    });
}
