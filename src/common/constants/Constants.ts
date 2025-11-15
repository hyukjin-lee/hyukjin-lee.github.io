export const DOMAIN = "https://hyukjin-lee.github.io";
export const SUPPORTED_LOCALES = ["ko", "en"] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: SupportedLocale = "ko";

export const Endpoints = {
  auth: "/auth",

  about: "/about",

  tech: "/tech",
  "tech.detail": "/tech/detail",
  "tech.create": "/tech/create",
  "tech.update": "/tech/update",

  blog: "/blog",
  "blog.detail": "/blog/detail",
  "blog.create": "/blog/create",
  "blog.update": "/blog/update",

  daily: "/daily",
  "daily.detail": "/daily/detail",
  "daily.create": "/daily/create",
  "daily.update": "/daily/update",

  musings: "/musings",
  places: "/places",
};

export const TITLE_POSTFIX = " :: 이혁진, Hyeokjin Lee";
export const API_HOST = "https://rough-leaf-7947.fly.dev/api";
export const GA_TRACKING_CODE = "G-S8YVF6MTRS";
