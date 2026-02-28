import { resolveStandardStackBackOptions } from "./stack-back-policy";

describe("resolveStandardStackBackOptions", () => {
  test("hides back button on root screen and never uses synthetic headerLeft", () => {
    expect(
      resolveStandardStackBackOptions({
        isIos: true,
        isRootScreen: true,
      })
    ).toEqual({
      headerBackButtonDisplayMode: "minimal",
      headerBackVisible: false,
      headerLeft: undefined,
    });
  });

  test("shows platform standard back button on non-root screen", () => {
    expect(
      resolveStandardStackBackOptions({
        isIos: true,
        isRootScreen: false,
      })
    ).toEqual({
      headerBackButtonDisplayMode: "minimal",
      headerBackVisible: true,
      headerLeft: undefined,
    });
  });

  test("keeps default display mode on non-iOS while preserving back visibility rules", () => {
    expect(
      resolveStandardStackBackOptions({
        isIos: false,
        isRootScreen: false,
      })
    ).toEqual({
      headerBackButtonDisplayMode: undefined,
      headerBackVisible: true,
      headerLeft: undefined,
    });
  });
});
