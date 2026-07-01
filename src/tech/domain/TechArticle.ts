import {formatDateTime} from "src/util";

export class TechArticle {
  public static createUri = ({date, slug}: {date: string, slug: string}) =>
    "/work" + formatDateTime(date, "/YYYY/MM/DD/") + slug;
}
