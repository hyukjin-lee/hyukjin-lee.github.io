import {formatDateTime} from "src/util";

export class LifeArticle {
  public static createUri = ({date, slug}: {date: string, slug: string}) =>
    "/life" + formatDateTime(date, "/YYYY/MM/DD/") + slug;
}
