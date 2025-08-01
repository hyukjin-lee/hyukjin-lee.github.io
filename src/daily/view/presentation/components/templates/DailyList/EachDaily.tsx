import * as React from "react";
import { DailyListResponse } from "../../../../../domain/DailyListResponse";
import DailyContentLinear from "../../organisms/DailyContentLinear";

interface Props {
  daily: DailyListResponse;
}

const EachDaily = ({ daily }: Props) => {
  return (
    <DailyContentLinear
      content={daily.content}
      linkPreviews={daily.linkPreviews}
      uri={daily.uri}
      title={daily.title}
      date={daily.date}
    />
  );
};

export default EachDaily;
