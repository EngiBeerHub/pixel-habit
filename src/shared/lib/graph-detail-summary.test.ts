import type { Pixel } from "../api/pixel";
import {
  buildGraphDetailSummary,
  formatQuantityLabel,
} from "./graph-detail-summary";

describe("graph detail summary", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 15, 11, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("builds summary for positive records", () => {
    const pixels: Pixel[] = [
      { date: "20260215", quantity: "3" },
      { date: "20260214", quantity: "2" },
      { date: "20260210", quantity: "0" },
      { date: "20260212", quantity: "5" },
    ];

    expect(buildGraphDetailSummary(pixels)).toEqual({
      averagePerRecordedDayText: "3.33",
      currentStreakDays: 2,
      longestStreakDays: 2,
      maxQuantityText: "5",
      positiveRecordCount: 3,
      totalQuantityText: "10",
    });
  });

  test("returns empty summary when no positive record exists", () => {
    const pixels: Pixel[] = [
      { date: "20260215", quantity: "0" },
      { date: "20260214", quantity: "-1" },
    ];

    expect(buildGraphDetailSummary(pixels)).toEqual({
      averagePerRecordedDayText: "-",
      currentStreakDays: 0,
      longestStreakDays: 0,
      maxQuantityText: "-",
      positiveRecordCount: 0,
      totalQuantityText: "0",
    });
  });

  test("formats quantity with unit", () => {
    expect(formatQuantityLabel("2", "Hour")).toBe("2 Hour");
    expect(formatQuantityLabel("2", "")).toBe("2");
    expect(formatQuantityLabel("", "Hour")).toBe("-");
  });
});
