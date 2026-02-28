import { resolveNativeMenuAvailability } from "./native-menu-capability";

describe("resolveNativeMenuAvailability", () => {
  test("returns true on iOS dev client runtime", () => {
    expect(
      resolveNativeMenuAvailability({
        appOwnership: null,
        platform: "ios",
      })
    ).toBe(true);
  });

  test("returns false on Expo Go runtime", () => {
    expect(
      resolveNativeMenuAvailability({
        appOwnership: "expo",
        platform: "ios",
      })
    ).toBe(false);
  });

  test("returns false on unsupported platform", () => {
    expect(
      resolveNativeMenuAvailability({
        appOwnership: null,
        platform: "web",
      })
    ).toBe(false);
  });
});
