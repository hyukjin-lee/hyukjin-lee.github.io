import * as React from "react";
import { MarkdownPreview } from "src/common/view/presentation/components/molecules";
import { makeStyles, createStyles } from "@mui/styles";
import { Theme, Avatar, Typography, Box, IconButton } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";

interface Props {
  content: string;
  authorName: string;
  authorHandle: string;
  avatarSrc: string;
  timestamp: string;
  linkPreviews?: Record<string, any>;
  uri?: string;
  title?: string;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    "&:hover": {
      boxShadow: theme.shadows[2],
    }
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    marginRight: theme.spacing(1),
  },
  authorInfo: {
    flexGrow: 1,
  },
  content: {
    fontFamily: "Noto Serif KR",
    fontWeight: 400,
    textIndent: ".5em",
    background: theme.palette.mode === "dark" ? theme.palette.background.paper : "#f4f4f4",
    padding: "5px 10px 5px 10px",
    margin: `0 ${theme.spacing(0.5)}`,
    fontSize: ".9em",
    lineHeight: "1.9em",
    border: `1px solid ${theme.palette.divider} !important`,
    borderRadius: 5,

    "& blockquote, pre": {
      backgroundColor: theme.palette.background.default,
      border: `1px solid ${theme.palette.divider} !important`,
      margin: `${theme.spacing(2)} 0`,
    },

    "& blockquote": {
      textIndent: "initial",
      padding: "0 20px",
    },

    "& table": {
      border: `1px solid ${theme.palette.divider}`
    }
  },
  footer: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(1),
  },
}));

const LogContent = ({ content, authorName, authorHandle, avatarSrc, timestamp, linkPreviews, uri, title }: Props) => {
  const classes = useStyles();
  
  const handleClick = () => {
    if (uri) {
      window.location.href = uri;
    }
  };
  
  return (
    <Box className={classes.root} onClick={handleClick}>
      <Box className={classes.header}>
        <Avatar alt={authorName} src={avatarSrc} className={classes.avatar} />
        <Box className={classes.authorInfo}>
          <Typography variant="subtitle1" fontWeight="bold">
            {authorName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            @{authorHandle}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {timestamp}
        </Typography>
      </Box>
      {title && (
        <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 1 }}>
          {title}
        </Typography>
      )}
      <MarkdownPreview className={classes.content} markdown={content} linkPreviews={linkPreviews} />
      <Box className={classes.footer}>
        <IconButton aria-label="comment" onClick={(e) => e.stopPropagation()}>
          <ChatBubbleOutlineIcon fontSize="small" />
        </IconButton>
        <IconButton aria-label="retweet" onClick={(e) => e.stopPropagation()}>
          <RepeatIcon fontSize="small" />
        </IconButton>
        <IconButton aria-label="like" onClick={(e) => e.stopPropagation()}>
          <FavoriteBorderIcon fontSize="small" />
        </IconButton>
        <IconButton aria-label="share" onClick={(e) => e.stopPropagation()}>
          <ShareIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default LogContent;
