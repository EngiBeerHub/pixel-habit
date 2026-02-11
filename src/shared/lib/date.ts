const NON_DIGIT_REGEX = /\D/g;

/**
 * 端末の現在日付を Pixela 指定の `yyyyMMdd` 形式へ変換する。
 */
export const getTodayAsYyyyMmDd = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

/**
 * `yyyyMMdd` 入力として使えるように、数字以外を除去し8桁に切り詰める。
 */
export const normalizeYyyyMmDdInput = (value: string): string => {
  return value.replace(NON_DIGIT_REGEX, "").slice(0, 8);
};
