/**
 * カレンダー期間の開始日・終了日を表す値。
 */
export interface CalendarRange {
  from: string;
  to: string;
}

/**
 * 表示モードの種別。
 */
export type CalendarMode = "month" | "year";

/**
 * 指定日の暦月（1日〜末日）を `yyyyMMdd` で返す。
 */
export const getCalendarMonthRange = (baseDate = new Date()): CalendarRange => {
  const date = normalizeDate(baseDate);
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    from: formatYyyyMmDd(startDate),
    to: formatYyyyMmDd(endDate),
  };
};

/**
 * 指定日の暦年（1月1日〜12月31日）を `yyyyMMdd` で返す。
 */
export const getCalendarYearRange = (baseDate = new Date()): CalendarRange => {
  const date = normalizeDate(baseDate);
  const startDate = new Date(date.getFullYear(), 0, 1);
  const endDate = new Date(date.getFullYear(), 11, 31);
  return {
    from: formatYyyyMmDd(startDate),
    to: formatYyyyMmDd(endDate),
  };
};

/**
 * 表示モードに応じた期間ラベルを返す。
 */
export const formatCalendarModeLabel = (
  mode: CalendarMode,
  baseDate = new Date()
): string => {
  const date = normalizeDate(baseDate);
  if (mode === "month") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }
  return `${date.getFullYear()}年`;
};

/**
 * Dateの時刻情報を切り捨てて日付のみを扱う。
 */
const normalizeDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * DateをPixela形式の `yyyyMMdd` へ変換する。
 */
const formatYyyyMmDd = (date: Date): string => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};
