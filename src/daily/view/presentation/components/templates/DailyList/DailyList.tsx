import {createStyles, makeStyles} from "@mui/styles";
import * as React from "react";
import EachDaily from "./EachDaily";
import {DailyListResponse} from "../../../../../domain/DailyListResponse";
import {Theme} from "@mui/material";

const useStyles = makeStyles((theme: Theme) => createStyles({
  feedContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    marginBottom: theme.spacing(3),
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "600px", // Adjust this value as needed for desired feed width
  }
}));

export interface DailyListProps {
  dailys: DailyListResponse[];
}

const DailyList = ({ dailys }: DailyListProps) => {
  const classes = useStyles();
  return (
    <div className={classes.feedContainer}>
      <div className={classes.contentWrapper}>
        {dailys.map(daily => (
          <EachDaily
            key={daily.id}
            daily={daily}
          />
        ))}
      </div>
    </div>
  );
};

export default DailyList;
