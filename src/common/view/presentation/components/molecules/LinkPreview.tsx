import * as React from "react";
import { Card, CardContent, Typography, Box, Link as MuiLink } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { Launch as LaunchIcon } from "@mui/icons-material";

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
      maxWidth: "100%",
      margin: `${theme.spacing(1.5)} 0`,
      cursor: "pointer",
      transition: "border-color 0.2s ease",
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.spacing(0.75),
      "&:hover": {
        borderColor: theme.palette.primary.main,
      },
    },
    cardContent: {
      padding: `${theme.spacing(1.5)} !important`,
      "&:last-child": {
        paddingBottom: `${theme.spacing(1.5)} !important`,
      },
    },
    container: {
      display: "flex",
      gap: theme.spacing(2),
    },
    imageContainer: {
      flexShrink: 0,
      width: 120,
      height: 80,
      borderRadius: theme.spacing(0.5),
      overflow: "hidden",
      backgroundColor: theme.palette.grey[100],
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    noImage: {
      color: theme.palette.grey[400],
      fontSize: "0.8rem",
    },
    content: {
      flex: 1,
      minWidth: 0, // flex item의 최소 너비를 0으로 설정
    },
    title: {
      fontWeight: 600,
      marginBottom: theme.spacing(0.5),
      color: theme.palette.text.primary,
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    description: {
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(1),
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(0.5),
      color: theme.palette.text.secondary,
    },
    siteName: {
      fontSize: "0.85rem",
      fontWeight: 500,
    },
    url: {
      fontSize: "0.8rem",
      color: theme.palette.text.disabled,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    icon: {
      fontSize: "1rem",
    },
    mobileContainer: {
      flexDirection: "column",
      [theme.breakpoints.down("sm")]: {
        "& $imageContainer": {
          width: "100%",
          height: 150,
        },
      },
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
    <Card className={`${classes.card} ${className || ""}`} onClick={handleClick}>
      <CardContent className={classes.cardContent}>
        <Box className={classes.container}>
          {data.image && (
            <div className={classes.imageContainer}>
              <img
                src={data.image}
                alt={data.title}
                className={classes.image}
                onError={(e) => {
                  // 이미지 로드 실패 시 숨김
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
          
          <div className={classes.content}>
            <Typography variant="body1" className={classes.title}>
              {data.title}
            </Typography>
            
            {data.description && (
              <Typography variant="body2" className={classes.description}>
                {data.description}
              </Typography>
            )}
            
            <Box className={classes.footer}>
              <LaunchIcon className={classes.icon} />
              <Typography className={classes.siteName}>
                {data.siteName || getDomain(data.url)}
              </Typography>
              <Typography className={classes.url}>
                • {getDomain(data.url)}
              </Typography>
            </Box>
          </div>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LinkPreview;