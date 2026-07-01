import {WorkArticle} from "src/work/domain/WorkArticle";

describe("WorkArticle", () => {
  test("createUri", () => {
    const date = "1970-01-01T00:00:00.000Z";
    const slug = "slug";
    expect(WorkArticle.createUri({date, slug})).toBe("/work/1970/01/01/slug");
  });
});
