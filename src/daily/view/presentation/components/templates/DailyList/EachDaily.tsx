import * as React from "react";
import { formatDateTime } from "src/util";
import { DailyListResponse } from "../../../../../domain/DailyListResponse";
import DailyContent from "../../organisms/DailyContent";
import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => createStyles({
  // No container styling needed here, as it's handled by DailyList
}));

interface Props {
  daily: DailyListResponse;
}

const EachDaily = ({ daily }: Props) => {
  const classes = useStyles();
  const authorName = "Hyuk's Daily"; // Placeholder
  const authorHandle = "hyuk_daily"; // Placeholder
  const avatarSrc = "/static/images/avatar.png"; // Placeholder - you might want to replace this with a real path
  const timestamp = formatDateTime(daily.date, "YYYY.MM.DD HH:mm");

  return (
    <DailyContent
      content={daily.content}
      authorName={authorName}
      authorHandle={authorHandle}
      avatarSrc={avatarSrc}
      timestamp={timestamp}
    />
  );
};

export default EachDaily;
