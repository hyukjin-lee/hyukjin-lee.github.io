import { LifeLoadPort } from "src/life/application/port/outgoing/LifeLoadPort";
import { LifeLoadPrevOrNextPort } from "src/life/application/port/outgoing/LoadLifePrevOrNext";
import { StrapiResponse } from "../../../common/domain/StrapiResponse";
import { AxiosInstance } from "axios";
import { Endpoints } from "../../../common/constants/Constants";
import RepositoryError from "../../../common/exception/RepositoryError";
import { LifeArticleListStrapi } from "../../application/port/outgoing/LifeArticleListStrapi";
import { LifeArticleStrapi } from "../../application/port/outgoing/LifeArticleStrapi";

export class LifePersistenceAdapter
  implements LifeLoadPort, LifeLoadPrevOrNextPort
{
  constructor(private readonly axios: AxiosInstance) {}

  private readonly listFields = ["seq", "title", "slug", "date"];
  private readonly defaultPrevOrNext: LifeArticleListStrapi = {
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
  ): Promise<StrapiResponse<LifeArticleListStrapi>> =>
    this.axios
      .get<StrapiResponse<LifeArticleListStrapi>>(Endpoints.life, {
        params: {
          fields: this.listFields,
          sort: ["seq:desc"],
          "pagination[page]": page,
          "pagination[pageSize]": 10,
        },
      })
      .then((it) => it.data);

  public getBySlug = async (slug: string): Promise<LifeArticleStrapi> => {
    const article: LifeArticleStrapi | undefined = await this.axios
      .get<{ data: LifeArticleStrapi[] }>(Endpoints.life, {
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

  public getNextOf = async (seq: number): Promise<LifeArticleListStrapi> => {
    const prev: LifeArticleListStrapi | undefined = await this.axios
      .get<{ data: LifeArticleListStrapi[] }>(Endpoints.life, {
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

  public getPrevOf = async (seq: number): Promise<LifeArticleListStrapi> => {
    const next: LifeArticleListStrapi | undefined = await this.axios
      .get<{ data: LifeArticleListStrapi[] }>(Endpoints.life, {
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
