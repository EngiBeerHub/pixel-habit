/**
 * Pixela日付形式（yyyyMMdd）の検証パターン。
 */
const YYYY_MM_DD_PATTERN = /^\d{8}$/;

/**
 * 指定DateをPixela日付形式（yyyyMMdd）へ変換する。
 */
export const formatPixelaDate = (date: Date): string => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

/**
 * `yyyyMMdd` をDateへ変換する。無効値は null を返す。
 */
export const parsePixelaDate = (value: string): Date | null => {
  if (!YYYY_MM_DD_PATTERN.test(value)) {
    return null;
  }
  const year = Number(value.slice(0, 4));
  const monthIndex = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  const parsed = new Date(year, monthIndex, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== monthIndex ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

/**
 * `yyyyMMdd` を `yyyy/MM/dd (EEE)` へ整形する。
 */
export const formatPixelaDateForDisplay = (
  value: string,
  locale = "ja-JP"
): string => {
  const parsedDate = parsePixelaDate(value);
  if (!parsedDate) {
    return value;
  }

  const weekday = parsedDate.toLocaleDateString(locale, {
    weekday: "short",
  });
  const yyyy = value.slice(0, 4);
  const mm = value.slice(4, 6);
  const dd = value.slice(6, 8);
  return `${yyyy}/${mm}/${dd} (${weekday})`;
};

/**
 * `yyyyMMdd` を `yyyy/MM/dd` へ整形する。
 */
export const formatPixelaDateForShortDisplay = (value: string): string => {
  const parsedDate = parsePixelaDate(value);
  if (!parsedDate) {
    return value;
  }

  const yyyy = value.slice(0, 4);
  const mm = value.slice(4, 6);
  const dd = value.slice(6, 8);
  return `${yyyy}/${mm}/${dd}`;
};

/**
 * 現在日付を時刻00:00で返す。
 */
export const getTodayAtMidnight = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
