import * as React from "react";
import { Typography, Link as MuiLink } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  error?: string;
}

interface Props {
  data: LinkPreviewData;
  className?: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      maxWidth: 480,
      height: 200,
      margin: `${theme.spacing(2)} auto`,
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)"}`,
      borderRadius: 16,
      overflow: "hidden",
      position: "relative",
      backgroundColor: theme.palette.grey[100],
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: theme.palette.mode === "dark" 
          ? "0 8px 25px rgba(0, 0, 0, 0.4)"
          : "0 8px 25px rgba(0, 0, 0, 0.15)",
      },
    },
    imageContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: theme.palette.grey[100],
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
      display: "block",
      margin: 0,
      padding: 0,
      border: "none",
      outline: "none",
    },
    noImagePlaceholder: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      color: theme.palette.text.disabled,
      fontSize: "0.875rem",
    },
    overlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      background: "linear-gradient(transparent, rgba(0, 0, 0, 0.85))",
      padding: theme.spacing(2),
      paddingTop: theme.spacing(4),
    },
    title: {
      fontWeight: 600,
      fontSize: "0.875rem",
      lineHeight: 1.3,
      color: "#ffffff",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
    },
    siteName: {
      fontSize: "0.75rem",
      fontWeight: 400,
      color: "rgba(255, 255, 255, 0.8)",
      marginTop: theme.spacing(0.5),
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
    },
  })
);

const LinkPreview: React.FC<Props> = ({ data, className }) => {
  const classes = useStyles();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    window.open(data.url, "_blank", "noopener,noreferrer");
  };

  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // 에러가 있거나 제목이 없는 경우 간단한 링크로 표시
  if (data.error || !data.title) {
    return (
      <MuiLink
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        sx={{ wordBreak: "break-all" }}
      >
        {data.url}
      </MuiLink>
    );
  }

  return (
    <div className={`${classes.card} ${className || ""}`} onClick={handleClick}>
      {/* Background Image or Placeholder */}
      <div className={classes.imageContainer}>
        {data.image ? (
          <img
            src={data.image}
            alt={data.title}
            className={classes.image}
            onError={(e) => {
              // 이미지 로드 실패 시 placeholder 표시
              const target = e.target as HTMLElement;
              target.style.display = "none";
              const placeholder = target.parentElement?.querySelector(".no-image-placeholder");
              if (placeholder) {
                (placeholder as HTMLElement).style.display = "flex";
              }
            }}
          />
        ) : null}
        <div 
          className={`${classes.noImagePlaceholder} no-image-placeholder`}
          style={{ display: data.image ? "none" : "flex" }}
        >
          {data.siteName || getDomain(data.url)}
        </div>
      </div>

      {/* Overlay with Title */}
      <div className={classes.overlay}>
        <Typography className={classes.title}>
          {data.title}
        </Typography>
        <Typography className={classes.siteName}>
          {data.siteName || getDomain(data.url)}
        </Typography>
      </div>
    </div>
  );
};

export default LinkPreview;