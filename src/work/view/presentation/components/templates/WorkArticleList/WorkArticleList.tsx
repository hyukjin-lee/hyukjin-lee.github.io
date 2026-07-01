import {createStyles, makeStyles} from "@mui/styles";
import * as React from "react";
import EachWorkArticle from "./EachWorkArticle";
import {StrapiPagination} from "src/common/domain/StrapiPagination";
import {WorkArticleListResponse} from "src/work/domain/WorkArticleListResponse";
import {Theme} from "@mui/material";

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    maxWidth: theme.spacing(75),
    margin: "auto",
    textAlign: "center",
    marginTop: `-${theme.spacing(1.5)}`
  }
}));

export interface WorkArticleListProps {
  workArticles: WorkArticleListResponse[];
  pagination: StrapiPagination,
}

const WorkArticleList = ({ workArticles }: WorkArticleListProps) => {
  const classes = useStyles();
  return <div>
    <div className={classes.container}>
      {workArticles.map(b => <EachWorkArticle key={b.id} workArticle={b} />)}
    </div>
  </div>;
};

export default WorkArticleList;
