import { createStyles, makeStyles } from "@mui/styles";
import * as React from "react";
import { Link } from "src/common/view/presentation/components/molecules";
import { formatDateTime } from "src/util";
import {LifeArticleListResponse} from "src/life/domain/LifeArticleListResponse";
import {Theme} from "@mui/material";
import {getLifeArticleMeta} from "../lifeArticleMeta";

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
    justifyContent: "center",
    marginBottom: theme.spacing(0.25),
    userSelect: "none"
  },
  date: {
    color: theme.palette.text.primary
  }
}));

interface Props {
  lifeArticle: LifeArticleListResponse;
}

const EachLifeArticle = ({ lifeArticle }: Props) => {
  const { title, date, uri, lifeType } = lifeArticle;
  const classes = useStyles();
  const meta = getLifeArticleMeta(lifeType);

  return <Link href={uri}>
    <div className={classes.container}>
      {meta && <div className={classes.meta}>
        <span>{meta.label}</span>
      </div>}
      <div className={classes.title}>{title}</div>
      <div className={classes.date}>{formatDateTime(date, "YYYY / MM / DD")}</div>
    </div>
  </Link >;
};

export default EachLifeArticle;
