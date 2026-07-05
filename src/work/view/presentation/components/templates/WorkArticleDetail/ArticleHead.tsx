import { createStyles, makeStyles } from "@mui/styles";
import * as React from "react";
import { Link } from "src/common/view/presentation/components/molecules";
import { formatDateTime } from "src/util";
import {Theme, Typography} from "@mui/material";
import {getWorkArticleMeta} from "../workArticleMeta";

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    margin: theme.spacing(2),
    textAlign: "center"
  },
  head: {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
    wordBreak: "keep-all",
  },
  date: {
    fontSize: theme.typography.subtitle1.fontSize,
    userSelect: "none"
  },
  meta: {
    alignItems: "center",
    color: theme.palette.text.secondary,
    display: "flex",
    fontSize: theme.typography.subtitle2.fontSize,
    gap: theme.spacing(0.75),
    justifyContent: "center",
    marginBottom: theme.spacing(0.75),
    userSelect: "none"
  },
  metaDot: {
    borderRadius: "50%",
    display: "inline-block",
    flex: "0 0 auto",
    height: 8,
    width: 8
  }
}));

interface Props {
  title: string;
  slug: string;
  date: string;
  workTopic?: string;
  workType?: string;
}

const ArticleHead = ({ title, slug, date, workTopic, workType }: Props) => {
  const classes = useStyles();
  const meta = getWorkArticleMeta(workTopic, workType);

  return <div className={classes.container}>
    {meta && <div className={classes.meta}>
      <span className={classes.metaDot} style={{ backgroundColor: meta.color }} />
      <span>{meta.label}</span>
    </div>}
    <div className={classes.head}>
      <Link href={"/work" + formatDateTime(date, "/YYYY/MM/DD/") + slug} color="textPrimary" shallow={true}>
        <Typography variant="h1">{title}</Typography>
      </Link>
    </div >
    <div className={classes.date}>{formatDateTime(date, "YYYY / MM / DD")}</div>
  </div >;
};

export default ArticleHead;
