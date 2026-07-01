import {formatDateTime} from "src/util";

export class WorkArticle {
  public static createUri = ({date, slug}: {date: string, slug: string}) =>
    "/work" + formatDateTime(date, "/YYYY/MM/DD/") + slug;
}
