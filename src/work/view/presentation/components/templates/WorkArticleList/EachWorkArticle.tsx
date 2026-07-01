import { createStyles, makeStyles } from "@mui/styles";
import * as React from "react";
import { Link } from "src/common/view/presentation/components/molecules";
import { formatDateTime } from "src/util";
import {WorkArticleListResponse} from "src/work/domain/WorkArticleListResponse";
import {Theme} from "@mui/material";

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
  date: {
    color: theme.palette.text.primary
  }
}));

interface Props {
  workArticle: WorkArticleListResponse;
}

const EachWorkArticle = ({ workArticle }: Props) => {
  const { title, date, uri } = workArticle;
  const classes = useStyles();
  return <Link href={uri}>
    <div className={classes.container}>
      <div className={classes.title}>{title}</div>
      <div className={classes.date}>{formatDateTime(date, "YYYY / MM / DD")}</div>
    </div>
  </Link >;
};

export default EachWorkArticle;
