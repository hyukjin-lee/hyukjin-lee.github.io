import * as React from "react";
import { LogListResponse } from "../../../../../domain/LogListResponse";
import LogContentLinear from "../../organisms/LogContentLinear";

interface Props {
  log: LogListResponse;
}

const EachLog = ({ log }: Props) => {
  return (
    <LogContentLinear
      content={log.content}
      linkPreviews={log.linkPreviews}
      uri={log.uri}
      title={log.title}
      date={log.date}
    />
  );
};

export default EachLog;
