import {BlogArticle} from "src/blog/domain/BlogArticle";

describe("BlogArticle", () => {
  test("createUri", () => {
    const date = "1970-01-01T00:00:00.000Z";
    const slug = "slug";
    expect(BlogArticle.createUri({date, slug})).toBe("/life/1970/01/01/slug");
  });
});
