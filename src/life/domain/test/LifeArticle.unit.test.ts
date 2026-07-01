import {LifeArticle} from "src/life/domain/LifeArticle";

describe("LifeArticle", () => {
  test("createUri", () => {
    const date = "1970-01-01T00:00:00.000Z";
    const slug = "slug";
    expect(LifeArticle.createUri({date, slug})).toBe("/life/1970/01/01/slug");
  });
});
