import {createStyles, makeStyles} from "@mui/styles";
import * as React from "react";
import {HeadTitle} from "src/common/view/presentation/components/molecules";
import {ArticleContent} from "../../organisms";
import ArticleHead from "./ArticleHead";
import ArticlePrevAndNext from "./ArticlePrevAndNext";
import {TechArticleDetailResponse} from "../../../../../domain/TechArticleDetailResponse";
import {Theme} from "@mui/material";

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    maxWidth: theme.spacing(100),
    margin: "auto"
  }
}));

export interface TechArticleDetailProps {
  techArticle: TechArticleDetailResponse;
}

const TechArticleDetail = ({ techArticle }: TechArticleDetailProps) => {
  const classes = useStyles();
  const { title, slug, content, date, prev, next, linkPreviews } = techArticle;
  return <>
    <HeadTitle title={title} />
    <div className={classes.container}>
      <ArticleHead title={title} slug={slug} date={date} />
      <ArticleContent content={content} linkPreviews={linkPreviews} />
      <ArticlePrevAndNext prev={prev} next={next} />
    </div>
  </>;
};

export default TechArticleDetail;
