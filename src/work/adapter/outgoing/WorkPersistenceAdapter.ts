import { WorkLoadPort } from "src/work/application/port/outgoing/WorkLoadPort";
import { WorkLoadPrevOrNextPort } from "src/work/application/port/outgoing/LoadWorkPrevOrNext";
import { StrapiResponse } from "../../../common/domain/StrapiResponse";
import { AxiosInstance } from "axios";
import { Endpoints } from "../../../common/constants/Constants";
import RepositoryError from "../../../common/exception/RepositoryError";
import { WorkArticleListStrapi } from "../../application/port/outgoing/WorkArticleListStrapi";
import { WorkArticleStrapi } from "../../application/port/outgoing/WorkArticleStrapi";

export class WorkPersistenceAdapter
  implements WorkLoadPort, WorkLoadPrevOrNextPort
{
  constructor(private readonly axios: AxiosInstance) {}

  private readonly listFields = ["seq", "title", "slug", "date"];
  private readonly defaultPrevOrNext: WorkArticleListStrapi = {
    id: -1,
    attributes: {
      seq: -1,
      date: "",
      updatedAt: "",
      slug: "",
      title: "",
    },
  };

  public findAll = (
    page: number
  ): Promise<StrapiResponse<WorkArticleListStrapi>> =>
    this.axios
      .get<StrapiResponse<WorkArticleListStrapi>>(Endpoints.work, {
        params: {
          fields: this.listFields,
          sort: ["seq:desc"],
          "pagination[page]": page,
          "pagination[pageSize]": 10,
        },
      })
      .then((it) => it.data);

  public getBySlug = async (slug: string): Promise<WorkArticleStrapi> => {
    const article: WorkArticleStrapi | undefined = await this.axios
      .get<{ data: WorkArticleStrapi[] }>(Endpoints.work, {
        params: {
          "filters[slug][$eq]": slug,
        },
      })
      .then((it) => it.data.data[0]);
    if (typeof article === "undefined") {
      throw RepositoryError.of();
    }

    return article;
  };

  public getNextOf = async (seq: number): Promise<WorkArticleListStrapi> => {
    const prev: WorkArticleListStrapi | undefined = await this.axios
      .get<{ data: WorkArticleListStrapi[] }>(Endpoints.work, {
        params: {
          "filters[seq][$gt]": seq,
          sort: ["seq:asc"],
          "pagination[pageSize]": 1,
          fields: this.listFields,
        },
      })
      .then((it) => it.data.data[0]);

    return prev || this.defaultPrevOrNext;
  };

  public getPrevOf = async (seq: number): Promise<WorkArticleListStrapi> => {
    const next: WorkArticleListStrapi | undefined = await this.axios
      .get<{ data: WorkArticleListStrapi[] }>(Endpoints.work, {
        params: {
          "filters[seq][$lt]": seq,
          sort: ["seq:desc"],
          "pagination[pageSize]": 1,
          fields: this.listFields,
        },
      })
      .then((it) => it.data.data[0]);

    return next || this.defaultPrevOrNext;
  };
}
