import {Daily} from "src/daily/domain/Daily";

describe("Daily", () => {
  test("createUri", () => {
    const date = "1970-01-01T00:00:00.000Z";
    const slug = "slug";
    expect(Daily.createUri({date, slug})).toBe("/log/1970/01/01/slug");
  });
});
