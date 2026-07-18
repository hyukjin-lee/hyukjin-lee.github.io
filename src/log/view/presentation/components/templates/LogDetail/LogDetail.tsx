import {createStyles, makeStyles} from "@mui/styles";
import * as React from "react";
import {HeadTitle} from "src/common/view/presentation/components/molecules";
import LogContentLinear from "../../organisms/LogContentLinear";
import {LogDetailResponse} from "../../../../../domain/LogDetailResponse";
import {Theme} from "@mui/material";

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    maxWidth: "550px",
    margin: "auto",
    padding: theme.spacing(4, 2),
  },
  contentWrapper: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
    overflow: "hidden",
    boxShadow: theme.palette.mode === "dark" 
      ? "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)"
      : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    backdropFilter: "blur(8px)",
  }
}));

export interface LogDetailProps {
  log: LogDetailResponse;
}

const LogDetail = ({ log }: LogDetailProps) => {
  const classes = useStyles();
  const {
    date,
    title,
    content,
    linkPreviews
  } = log;
  const headTitle = title?.trim() || `Log ${date}`;

  return <>
    <HeadTitle title={headTitle} />
    <div className={classes.container}>
      <div className={classes.contentWrapper}>
        <LogContentLinear 
          content={content} 
          linkPreviews={linkPreviews}
          title={title}
          date={date}
        />
      </div>
    </div>
  </>;
};

export default LogDetail;
