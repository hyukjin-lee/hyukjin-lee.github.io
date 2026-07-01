import {LogFindAllUseCase} from "./incoming/LogFindAllUseCase";
import {LogGetUseCase} from "./incoming/LogGetUseCase";
import {LogLoadPort} from "./outgoing/LogLoadPort";
import {LogDetailResponse} from "../../domain/LogDetailResponse";
import {LogListResponse} from "../../domain/LogListResponse";
import {StrapiResponse} from "../../../common/domain/StrapiResponse";
import {Log} from "../../domain";

export class LogService implements LogFindAllUseCase, LogGetUseCase{

  constructor(private readonly loadLogPort: LogLoadPort) { }

  public getBySlug = (slug: string): Promise<LogDetailResponse> =>
    this.loadLogPort.getBySlug(slug)
      .then(it => ({
        id: "" + it.id,
        seq: it.attributes.seq,
        date: it.attributes.date,
        updatedAt: it.attributes.updatedAt,
        title: it.attributes.title,
        slug: it.attributes.slug,
        content: it.attributes.content,
      }));

  public findAll = (page: number): Promise<StrapiResponse<LogListResponse>> =>
    this.loadLogPort.findAll(page)
      .then(data => ({
        data: data.data.map(it => ({
          id: "" + it.id,
          seq: it.attributes.seq,
          date: it.attributes.date,
          uri: Log.createUri({date: it.attributes.date, slug: it.attributes.slug}),
          title: it.attributes.title,
          content: it.attributes.content,
        })),
        meta: data.meta,
      }));
}
