/** @type {import('next').NextConfig} */
const repo = process.env.GITHUB_REPOSITORY_NAME || "";
const isGithubPages = process.env.GITHUB_PAGES === "true";

module.exports = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 1000,
  trailingSlash: true,
  ...(isGithubPages && repo
    ? { assetPrefix: `/${repo}`, basePath: `/${repo}` }
    : {}),
};
