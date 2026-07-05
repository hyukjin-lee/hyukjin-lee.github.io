import { createStyles, makeStyles } from "@mui/styles";
import * as React from "react";
import { Link } from "src/common/view/presentation/components/molecules";
import { formatDateTime } from "src/util";
import {WorkArticleListResponse} from "src/work/domain/WorkArticleListResponse";
import {Theme} from "@mui/material";
import {getWorkArticleMeta} from "../workArticleMeta";

const hoverBackgroundBrightColor = "230, 230, 230";
const hoverBackgroundDarkColor = "60, 60, 60";

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    padding: `${theme.spacing(1.5)} 0`,
    marginBottom: theme.spacing(1),
    "&:hover": {
      background: `rgba(${theme.palette.mode === "dark"
        ? hoverBackgroundDarkColor
        : hoverBackgroundBrightColor }, 0.23) !important`
    },
    "& > div": {
      padding: "1px 0"
    }
  },
  title: {
    fontSize: "1.18em"
  },
  meta: {
    alignItems: "center",
    color: theme.palette.text.secondary,
    display: "flex",
    fontSize: "0.78em",
    gap: theme.spacing(0.75),
    justifyContent: "center",
    marginBottom: theme.spacing(0.25),
    userSelect: "none"
  },
  metaDot: {
    borderRadius: "50%",
    display: "inline-block",
    flex: "0 0 auto",
    height: 7,
    width: 7
  },
  date: {
    color: theme.palette.text.primary
  }
}));

interface Props {
  workArticle: WorkArticleListResponse;
}

const EachWorkArticle = ({ workArticle }: Props) => {
  const { title, date, uri, workTopic, workType } = workArticle;
  const classes = useStyles();
  const meta = getWorkArticleMeta(workTopic, workType);

  return <Link href={uri}>
    <div className={classes.container}>
      {meta && <div className={classes.meta}>
        <span className={classes.metaDot} style={{ backgroundColor: meta.color }} />
        <span>{meta.label}</span>
      </div>}
      <div className={classes.title}>{title}</div>
      <div className={classes.date}>{formatDateTime(date, "YYYY / MM / DD")}</div>
    </div>
  </Link >;
};

export default EachWorkArticle;
