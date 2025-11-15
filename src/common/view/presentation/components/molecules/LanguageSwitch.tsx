import * as React from "react";
import {IconButton, Tooltip, useTheme, type SxProps, type Theme} from "@mui/material";
import {useRouter} from "next/router";
import TranslateIcon from "@mui/icons-material/Translate";
import {DEFAULT_LOCALE, SupportedLocale} from "src/common/constants/Constants";

interface Props {
  variant?: "inline" | "floating";
}

const LanguageSwitch = ({ variant = "inline" }: Props) => {
  const theme = useTheme();
  const router = useRouter();
  const currentLocale = (router.locale as SupportedLocale) || DEFAULT_LOCALE;
  const nextLocale: SupportedLocale = currentLocale === "ko" ? "en" : "ko";
  const tooltipLabel = currentLocale === "ko" ? "View in English" : "한국어로 보기";

  const handleClick = React.useCallback(() => {
    router.push(router.asPath, router.asPath, { locale: nextLocale });
  }, [nextLocale, router]);

  const sharedButtonSx: SxProps<Theme> = variant === "floating"
    ? {
      position: "absolute",
      top: theme.spacing(2),
      right: theme.spacing(7),
    }
    : { ml: 1 };

  return (
    <Tooltip title={tooltipLabel}>
      <IconButton
        onClick={handleClick}
        sx={{ width: 30, height: 30, ...sharedButtonSx }}
        size="small"
        aria-label="Change language"
      >
        <TranslateIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );
};

export default LanguageSwitch;
