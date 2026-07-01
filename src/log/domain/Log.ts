import {formatDateTime} from "src/util";

export class Log {
  public static createUri = ({date, slug}: {date: string, slug: string}) =>
    "/log" + formatDateTime(date, "/YYYY/MM/DD/") + slug;
}
