import {Log} from "src/log/domain/Log";

describe("Log", () => {
  test("createUri", () => {
    const date = "1970-01-01T00:00:00.000Z";
    const slug = "slug";
    expect(Log.createUri({date, slug})).toBe("/log/1970/01/01/slug");
  });
});
