import { resolveHeaderLargeTitle } from "./header-title-policy";

describe("resolveHeaderLargeTitle", () => {
  test("returns true for overview screens on iOS", () => {
    expect(
      resolveHeaderLargeTitle({
        isIos: true,
        screenType: "overview",
      })
    ).toBe(true);
  });

  test("returns false for form screens on iOS", () => {
    expect(
      resolveHeaderLargeTitle({
        isIos: true,
        screenType: "form",
      })
    ).toBe(false);
  });

  test("returns false for non-iOS screens", () => {
    expect(
      resolveHeaderLargeTitle({
        isIos: false,
        screenType: "overview",
      })
    ).toBe(false);
  });
});
