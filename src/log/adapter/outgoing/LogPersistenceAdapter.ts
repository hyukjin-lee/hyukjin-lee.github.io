import {StrapiResponse} from "../../../common/domain/StrapiResponse";
import {AxiosInstance} from "axios";
import {Endpoints} from "../../../common/constants/Constants";
import RepositoryError from "../../../common/exception/RepositoryError";
import {LogLoadPort} from "../../application/port/outgoing/LogLoadPort";
import {LogListStrapi} from "../../application/port/outgoing/LogListStrapi";
import {LogStrapi} from "../../application/port/outgoing/LogStrapi";

export class LogPersistenceAdapter implements LogLoadPort {

  constructor(private readonly axios: AxiosInstance) {}

  private readonly listFields = ["seq", "title", "slug", "date", "content"];

  public findAll = (page: number): Promise<StrapiResponse<LogListStrapi>> =>
    this.axios.get<StrapiResponse<LogListStrapi>>(Endpoints.log, {
      params: {
        fields: this.listFields,
        sort: ["seq:desc"],
        "pagination[page]": page,
        "pagination[pageSize]": 20
      }
    }).then(it => it.data);

  public getBySlug = async (slug: string): Promise<LogStrapi> => {
    const article: LogStrapi | undefined =
      await this.axios.get<{ data: LogStrapi[] }>(Endpoints.log, {
        params: {
          "filters[slug][$eq]": slug
        }
      })
        .then(it => it.data.data[0]);
    if (typeof article === "undefined") {
      throw RepositoryError.of();
    }

    return article;
  };
}
