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
    marginBottom: theme.spacing(4),
    padding: theme.spacing(0, 2),
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "780px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
    overflow: "hidden",
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
      : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    backdropFilter: "blur(8px)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    
    "&:hover": {
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)'
        : '0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
    }
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
