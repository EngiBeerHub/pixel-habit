import {
  formatPixelaDate,
  formatPixelaDateForDisplay,
  getTodayAtMidnight,
  parsePixelaDate,
} from "./pixela-date";

const DISPLAY_DATE_PATTERN = /^2026\/02\/05 \(.+\)$/;

describe("pixela date helpers", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 22, 16, 20, 30));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("formats date to yyyyMMdd", () => {
    expect(formatPixelaDate(new Date(2026, 1, 5))).toBe("20260205");
  });

  test("parses valid yyyyMMdd and rejects invalid values", () => {
    expect(parsePixelaDate("20260205")).toEqual(new Date(2026, 1, 5));
    expect(parsePixelaDate("20260231")).toBeNull();
    expect(parsePixelaDate("2026-02-05")).toBeNull();
  });

  test("formats yyyyMMdd as display string", () => {
    expect(formatPixelaDateForDisplay("20260205")).toMatch(
      DISPLAY_DATE_PATTERN
    );
  });

  test("returns original text for invalid values", () => {
    expect(formatPixelaDateForDisplay("invalid")).toBe("invalid");
  });

  test("returns today's date at midnight", () => {
    expect(getTodayAtMidnight()).toEqual(new Date(2026, 1, 22));
  });
});
