import {createStyles, makeStyles} from "@mui/styles";
import * as React from "react";
import {HeadTitle} from "src/common/view/presentation/components/molecules";
import {ArticleContent} from "../../organisms";
import ArticleHead from "./ArticleHead";
import ArticlePrevAndNext from "./ArticlePrevAndNext";
import {LifeArticleDetailResponse} from "../../../../../domain/LifeArticleDetailResponse";
import {Theme} from "@mui/material";

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    maxWidth: theme.spacing(100),
    margin: "auto"
  }
}));

export interface LifeArticleDetailProps {
  lifeArticle: LifeArticleDetailResponse;
}

const LifeArticleDetail = ({ lifeArticle }: LifeArticleDetailProps) => {
  const classes = useStyles();
  const { title, slug, content, date, prev, next, linkPreviews, lifeType } = lifeArticle;
  return <>
    <HeadTitle title={title} />
    <div className={classes.container}>
      <ArticleHead title={title} slug={slug} date={date} lifeType={lifeType} />
      <ArticleContent content={content} linkPreviews={linkPreviews} />
      <ArticlePrevAndNext prev={prev} next={next} />
    </div>
  </>;
};

export default LifeArticleDetail;
