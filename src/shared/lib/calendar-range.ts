/**
 * カレンダー期間の開始日・終了日を表す値。
 */
export interface CalendarRange {
  from: string;
  to: string;
  weeks: 14 | 53;
}

/**
 * 表示モードの種別。
 */
export type CalendarMode = "short" | "full";

/**
 * Graph DetailのShort表示期間（14週）を返す。
 */
export const getGraphDetailShortRange = (
  baseDate = new Date()
): CalendarRange => buildHeatmapRange(baseDate, 14);

/**
 * Graph DetailのFull表示期間（53週）を返す。
 */
export const getGraphDetailFullRange = (baseDate = new Date()): CalendarRange =>
  buildHeatmapRange(baseDate, 53);

/**
 * 表示モードに応じた期間ラベルを返す。
 */
export const formatGraphDetailModeLabel = (mode: CalendarMode): string => {
  if (mode === "short") {
    return "Short (14週)";
  }
  return "Full (53週)";
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

/**
 * 指定日を含む週の開始日（日曜）を返す。
 */
const getStartOfWeek = (date: Date): Date => {
  const normalized = normalizeDate(date);
  normalized.setDate(normalized.getDate() - normalized.getDay());
  return normalized;
};

/**
 * 週数ベースでGraph Detail表示範囲を返す。
 */
const buildHeatmapRange = (baseDate: Date, weeks: 14 | 53): CalendarRange => {
  const today = normalizeDate(baseDate);
  const endDate = today;
  const currentWeekStart = getStartOfWeek(today);
  const startDate = new Date(currentWeekStart);
  startDate.setDate(currentWeekStart.getDate() - (weeks - 1) * 7);

  return {
    from: formatYyyyMmDd(startDate),
    to: formatYyyyMmDd(endDate),
    weeks,
  };
};
