import {
  formatCalendarModeLabel,
  getCalendarMonthRange,
  getCalendarYearRange,
} from "./calendar-range";

describe("calendar range", () => {
  test("returns calendar month range", () => {
    const range = getCalendarMonthRange(new Date(2026, 1, 14, 20, 30, 1));

    expect(range).toEqual({
      from: "20260201",
      to: "20260228",
    });
  });

  test("returns calendar year range", () => {
    const range = getCalendarYearRange(new Date(2026, 6, 14, 20, 30, 1));

    expect(range).toEqual({
      from: "20260101",
      to: "20261231",
    });
  });

  test("formats mode label", () => {
    const date = new Date(2026, 1, 14);

    expect(formatCalendarModeLabel("month", date)).toBe("2026年2月");
    expect(formatCalendarModeLabel("year", date)).toBe("2026年");
  });
});
