import {WorkFindAllUseCase} from "./port/incoming/WorkFindAllUseCase";
import {WorkGetUseCase} from "./port/incoming/WorkGetUseCase";
import {WorkGetPrevOrNextUseCase} from "./port/incoming/WorkGetPrevOrNextUseCase";
import {StrapiResponse} from "../../common/domain/StrapiResponse";
import {WorkLoadPort} from "./port/outgoing/WorkLoadPort";
import {WorkLoadPrevOrNextPort} from "./port/outgoing/LoadWorkPrevOrNext";
import {WorkArticle} from "../domain";
import {WorkArticleDetailResponse, WorkArticlePrevOrNext} from "../domain/WorkArticleDetailResponse";
import {WorkArticleListResponse} from "../domain/WorkArticleListResponse";
import {WorkArticleListStrapi} from "./port/outgoing/WorkArticleListStrapi";

export class WorkService implements WorkFindAllUseCase, WorkGetUseCase, WorkGetPrevOrNextUseCase{

  private readonly defaultPrevOrNext: WorkArticlePrevOrNext = {
    id: "",
    date: "",
    title: "",
    uri: "",
  };

  constructor(
    private readonly loadWorkPort: WorkLoadPort,
    private readonly loadWorkPrevOrNextPort: WorkLoadPrevOrNextPort
  ) { }

  public getBySlug = (slug: string): Promise<WorkArticleDetailResponse> =>
    this.loadWorkPort.getBySlug(slug)
      .then(it => ({
        id: "" + it.id,
        seq: it.attributes.seq,
        date: it.attributes.date,
        updatedAt: it.attributes.updatedAt,
        title: it.attributes.title,
        workType: it.attributes.workType,
        slug: it.attributes.slug,
        content: it.attributes.content,
        prev: this.defaultPrevOrNext,
        next: this.defaultPrevOrNext
      }));

  public findAll = (page: number): Promise<StrapiResponse<WorkArticleListResponse>> =>
    this.loadWorkPort.findAll(page)
      .then(data => ({
        data: data.data.map(it => ({
          id: "" + it.id,
          seq: it.attributes.seq,
          date: it.attributes.date,
          uri: WorkArticle.createUri({date: it.attributes.date, slug: it.attributes.slug}),
          title: it.attributes.title,
          workType: it.attributes.workType,
        })),
        meta: data.meta,
      }));

  public getPrevOf = (seq: number): Promise<WorkArticlePrevOrNext> =>
    this.loadWorkPrevOrNextPort.getPrevOf(seq).then(this.convertListToPrevOrNext);

  public getNextOf = (seq: number): Promise<WorkArticlePrevOrNext> =>
    this.loadWorkPrevOrNextPort.getNextOf(seq).then(this.convertListToPrevOrNext);

  private convertListToPrevOrNext = (list: WorkArticleListStrapi): WorkArticlePrevOrNext =>
    ({
      id: "" + list.id,
      date: list.attributes.date,
      title: list.attributes.title,
      uri: WorkArticle.createUri({date: list.attributes.date, slug: list.attributes.slug}),
    });
}
