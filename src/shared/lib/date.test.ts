import { getTodayAsYyyyMmDd, normalizeYyyyMmDdInput } from "./date";

describe("date utilities", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("getTodayAsYyyyMmDd returns yyyyMMdd format", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 2, 12, 0, 0));

    expect(getTodayAsYyyyMmDd()).toBe("20260102");
  });

  test("normalizeYyyyMmDdInput strips non-digit and trims to 8 chars", () => {
    expect(normalizeYyyyMmDdInput("2026-01-02abc999")).toBe("20260102");
  });
});
