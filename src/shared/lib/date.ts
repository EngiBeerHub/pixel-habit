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
