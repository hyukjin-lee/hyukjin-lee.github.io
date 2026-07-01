import {TechArticle} from "src/tech/domain/TechArticle";

describe("TechArticle", () => {
  test("createUri", () => {
    const date = "1970-01-01T00:00:00.000Z";
    const slug = "slug";
    expect(TechArticle.createUri({date, slug})).toBe("/work/1970/01/01/slug");
  });
});
