import { DOMAIN, DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from "../constants/Constants";
import type { LocaleUri } from "../../data/markdownDataLoader";

const ensureLeadingSlash = (path: string): string => {
  if (!path) {
    return "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
};

const normalizeRoot = (path: string): string => (path === "" ? "/" : path);

export const buildLocalizedPath = (locale: SupportedLocale, path: string): string => {
  const normalizedPath = normalizeRoot(ensureLeadingSlash(path));
  if (locale === DEFAULT_LOCALE) {
    return normalizedPath;
  }
  if (normalizedPath === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalizedPath}`.replace(/\/{2,}/g, "/");
};

export const buildCanonicalUrl = (locale: SupportedLocale, path: string): string => {
  const localizedPath = buildLocalizedPath(locale, path);
  return `${DOMAIN}${localizedPath === "/" ? "" : localizedPath}`;
};

export const buildLanguageAlternatesForAllLocales = (path: string) => {
  const normalizedPath = normalizeRoot(ensureLeadingSlash(path));
  const alternates = SUPPORTED_LOCALES.map((locale) => ({
    hrefLang: locale,
    href: buildCanonicalUrl(locale, normalizedPath),
  }));

  const defaultHref = alternates.find((alternate) => alternate.hrefLang === DEFAULT_LOCALE)?.href ?? alternates[0]?.href ?? DOMAIN;
  return [
    ...alternates,
    {
      hrefLang: "x-default",
      href: defaultHref,
    },
  ];
};

export const localeUrisToLanguageAlternates = (uris: LocaleUri[]) => {
  const uniqueMap = new Map<string, string>();
  uris.forEach(({ locale, uri }) => {
    uniqueMap.set(locale, `${DOMAIN}${uri === "/" ? "" : uri}`);
  });

  const alternates = Array.from(uniqueMap.entries()).map(([locale, href]) => ({
    hrefLang: locale,
    href,
  }));

  const defaultHref =
    uniqueMap.get(DEFAULT_LOCALE) ??
    alternates[0]?.href ??
    `${DOMAIN}`;

  return [
    ...alternates,
    {
      hrefLang: "x-default",
      href: defaultHref,
    },
  ];
};
