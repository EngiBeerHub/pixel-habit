import {
  formatGraphDetailModeLabel,
  getGraphDetailFullRange,
  getGraphDetailShortRange,
} from "./calendar-range";

describe("calendar range", () => {
  test("returns short range with 14 weeks", () => {
    const range = getGraphDetailShortRange(new Date(2026, 1, 14, 20, 30, 1));

    expect(range).toEqual({
      from: "20251109",
      to: "20260214",
      weeks: 14,
    });
  });

  test("returns full range with 53 weeks", () => {
    const range = getGraphDetailFullRange(new Date(2026, 1, 14, 20, 30, 1));

    expect(range).toEqual({
      from: "20250209",
      to: "20260214",
      weeks: 53,
    });
  });

  test("formats mode label", () => {
    expect(formatGraphDetailModeLabel("short")).toBe("Short (14週)");
    expect(formatGraphDetailModeLabel("full")).toBe("Full (53週)");
  });
});
