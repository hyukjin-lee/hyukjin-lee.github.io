import * as React from "react";
import { MarkdownPreview } from "src/common/view/presentation/components/molecules";
import { makeStyles, createStyles } from "@mui/styles";
import { Theme, Typography, Box } from "@mui/material";
import { formatDateTime } from "src/util";

interface Props {
  content: string;
  linkPreviews?: Record<string, any>;
  uri?: string;
  title?: string;
  date: string;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    padding: `${theme.spacing(4)} ${theme.spacing(3)}`,
    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
    cursor: "pointer",
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    
    "&:hover": {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.02)' 
        : 'rgba(0, 0, 0, 0.015)',
      "&::before": {
        opacity: 1,
        transform: "scaleY(1)",
      }
    },
    
    "&:last-child": {
      borderBottom: "none",
    },
    
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "3px",
      backgroundColor: theme.palette.primary.main,
      opacity: 0,
      transform: "scaleY(0)",
      transformOrigin: "center",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    }
  },
  
  header: {
    display: "flex",
    alignItems: "baseline",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  
  date: {
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: theme.palette.text.secondary,
    fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", monospace',
    letterSpacing: "0.025em",
    textTransform: "uppercase",
    minWidth: "60px",
  },
  
  separator: {
    color: theme.palette.text.disabled,
    fontSize: "0.75rem",
    opacity: 0.6,
  },
  
  title: {
    fontSize: "1rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    letterSpacing: "-0.025em",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    lineHeight: 1.4,
  },
  
  content: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: "0.9375rem",
    lineHeight: 1.65,
    color: theme.palette.text.primary,
    letterSpacing: "-0.014em",
    margin: 0,
    
    "& p": {
      margin: `${theme.spacing(1.5)} 0`,
      "&:first-child": {
        marginTop: 0,
      },
      "&:last-child": {
        marginBottom: 0,
      }
    },
    
    "& pre": {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.04)' 
        : 'rgba(0, 0, 0, 0.04)',
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      borderRadius: theme.spacing(1),
      padding: theme.spacing(2),
      fontSize: "0.8125rem",
      margin: `${theme.spacing(2)} 0`,
      overflow: "auto",
      fontFamily: '"JetBrains Mono", "SF Mono", monospace',
    },
    
    "& blockquote": {
      borderLeft: `3px solid ${theme.palette.primary.main}`,
      paddingLeft: theme.spacing(2.5),
      margin: `${theme.spacing(2)} 0`,
      color: theme.palette.text.secondary,
      fontStyle: "italic",
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.02)' 
        : 'rgba(0, 0, 0, 0.02)',
      borderRadius: `0 ${theme.spacing(0.5)} ${theme.spacing(0.5)} 0`,
      padding: `${theme.spacing(1.5)} ${theme.spacing(2.5)}`,
    },
    
    "& ul, & ol": {
      paddingLeft: theme.spacing(2.5),
      margin: `${theme.spacing(1.5)} 0`,
      
      "& li": {
        marginBottom: theme.spacing(0.5),
        lineHeight: 1.6,
      }
    },
    
    "& a": {
      color: theme.palette.primary.main,
      textDecoration: "none",
      fontWeight: 500,
      borderBottom: `1px solid transparent`,
      transition: "border-color 0.2s ease",
      "&:hover": {
        borderBottomColor: theme.palette.primary.main,
      }
    },
    
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      fontWeight: 600,
      letterSpacing: "-0.025em",
      color: theme.palette.text.primary,
      margin: `${theme.spacing(2)} 0 ${theme.spacing(1)} 0`,
      
      "&:first-child": {
        marginTop: 0,
      }
    },
    
    "& h1": { fontSize: "1.5rem" },
    "& h2": { fontSize: "1.25rem" },
    "& h3": { fontSize: "1.125rem" },
    "& h4": { fontSize: "1rem" },
    "& h5": { fontSize: "0.9375rem" },
    "& h6": { fontSize: "0.875rem" },
    
    "& hr": {
      border: "none",
      height: "1px",
      backgroundColor: theme.palette.divider,
      margin: `${theme.spacing(3)} 0`,
    },
    
    "& img": {
      maxWidth: "100%",
      height: "auto",
      borderRadius: theme.spacing(1),
      margin: `${theme.spacing(2)} 0`,
    },
    
    "& table": {
      width: "100%",
      borderCollapse: "collapse",
      margin: `${theme.spacing(2)} 0`,
      fontSize: "0.875rem",
      
      "& th, & td": {
        padding: theme.spacing(1),
        textAlign: "left",
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
      
      "& th": {
        fontWeight: 600,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.04)' 
          : 'rgba(0, 0, 0, 0.04)',
      }
    }
  }
}));

const DailyContentLinear: React.FC<Props> = ({ 
  content, 
  linkPreviews, 
  uri, 
  title, 
  date 
}) => {
  const classes = useStyles();
  
  const handleClick = () => {
    if (uri) {
      window.location.href = uri;
    }
  };
  
  const formatDate = (dateString: string) => {
    return formatDateTime(dateString, "MMM DD");
  };
  
  return (
    <Box className={classes.root} onClick={handleClick}>
      <Box className={classes.header}>
        <Typography className={classes.date}>
          {formatDate(date)}
        </Typography>
        <Typography className={classes.separator}>•</Typography>
        <Typography className={classes.title}>
          {title}
        </Typography>
      </Box>
      
      <Box className={classes.content}>
        <MarkdownPreview 
          markdown={content} 
          linkPreviews={linkPreviews}
        />
      </Box>
    </Box>
  );
};

export default DailyContentLinear;