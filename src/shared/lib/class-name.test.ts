import { mergeClassNames } from "./class-name";

describe("mergeClassNames", () => {
  test("drops empty values", () => {
    expect(mergeClassNames("px-2", undefined, "py-3")).toBe("px-2 py-3");
  });

  test("resolves tailwind conflicts", () => {
    expect(mergeClassNames("px-2", "px-6", "text-sm", "text-lg")).toBe(
      "px-6 text-lg"
    );
  });
});
