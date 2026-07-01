import {createStyles, makeStyles} from "@mui/styles";
import * as React from "react";
import EachLifeArticle from "./EachLifeArticle";
import {StrapiPagination} from "src/common/domain/StrapiPagination";
import {LifeArticleListResponse} from "src/life/domain/LifeArticleListResponse";
import {Theme} from "@mui/material";

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    maxWidth: theme.spacing(75),
    margin: "auto",
    textAlign: "center",
    marginTop: `-${theme.spacing(1.5)}`
  }
}));

export interface LifeArticleListProps {
  lifeArticles: LifeArticleListResponse[];
  pagination: StrapiPagination,
}

const LifeArticleList = ({ lifeArticles }: LifeArticleListProps) => {
  const classes = useStyles();
  return <div>
    <div className={classes.container}>
      {lifeArticles.map(b => <EachLifeArticle key={b.id} lifeArticle={b} />)}
    </div>
  </div>;
};

export default LifeArticleList;
