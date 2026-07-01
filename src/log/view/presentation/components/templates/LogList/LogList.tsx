import {createStyles, makeStyles} from "@mui/styles";
import * as React from "react";
import EachLog from "./EachLog";
import {LogListResponse} from "../../../../../domain/LogListResponse";
import {Theme} from "@mui/material";

const useStyles = makeStyles((theme: Theme) => createStyles({
  feedContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    marginBottom: theme.spacing(4),
    padding: theme.spacing(4, 2),
    position: "relative",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "550px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
    overflow: "visible",
    boxShadow: theme.palette.mode === "dark" 
      ? "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)"
      : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    backdropFilter: "blur(8px)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    marginBottom: theme.spacing(6),
    position: "relative",
    zIndex: 1,
    
    "&:hover": {
      boxShadow: theme.palette.mode === "dark" 
        ? "0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)"
        : "0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    
    "&:not(:last-child)::after": {
      content: "\"\"",
      position: "absolute",
      left: "50%",
      top: "calc(100% + 12px)",
      transform: "translateX(-50%)",
      width: "1px",
      height: "24px",
      backgroundColor: theme.palette.mode === "dark" 
        ? "rgba(255, 255, 255, 0.15)" 
        : "rgba(0, 0, 0, 0.15)",
      zIndex: 0,
    }
  }
}));

export interface LogListProps {
  logs: LogListResponse[];
}

const LogList = ({ logs }: LogListProps) => {
  const classes = useStyles();
  return (
    <div className={classes.feedContainer}>
      {logs.map(log => (
        <div key={log.id} className={classes.contentWrapper}>
          <EachLog
            log={log}
          />
        </div>
      ))}
    </div>
  );
};

export default LogList;
