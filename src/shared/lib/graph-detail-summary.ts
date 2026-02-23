import type { Pixel } from "../api/pixel";
import {
  formatPixelaDate,
  getTodayAtMidnight,
  parsePixelaDate,
} from "./pixela-date";

const TRAILING_DECIMAL_ZERO_PATTERN = /\.?0+$/;

/**
 * Graph詳細画面で表示する統計情報。
 */
export interface GraphDetailSummary {
  averagePerRecordedDayText: string;
  currentStreakDays: number;
  longestStreakDays: number;
  maxQuantityText: string;
  positiveRecordCount: number;
  totalQuantityText: string;
}

/**
 * 取得済みピクセル配列からGraph詳細統計を算出する。
 */
export const buildGraphDetailSummary = (
  pixels: Pixel[]
): GraphDetailSummary => {
  const positiveEntries = pixels
    .map((pixel) => ({
      date: pixel.date,
      quantity: Number(pixel.quantity),
    }))
    .filter((entry) => Number.isFinite(entry.quantity) && entry.quantity >= 1);

  if (positiveEntries.length === 0) {
    return {
      averagePerRecordedDayText: "-",
      currentStreakDays: 0,
      longestStreakDays: 0,
      maxQuantityText: "-",
      positiveRecordCount: 0,
      totalQuantityText: "0",
    };
  }

  const total = positiveEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const max = Math.max(...positiveEntries.map((entry) => entry.quantity));
  const average = total / positiveEntries.length;
  const positiveDates = new Set(positiveEntries.map((entry) => entry.date));

  return {
    averagePerRecordedDayText: formatNumber(average),
    currentStreakDays: resolveCurrentStreak(positiveDates),
    longestStreakDays: resolveLongestStreak(positiveDates),
    maxQuantityText: formatNumber(max),
    positiveRecordCount: positiveEntries.length,
    totalQuantityText: formatNumber(total),
  };
};

/**
 * 数量表示に単位を付与して返す。
 */
export const formatQuantityLabel = (quantity: string, unit: string): string => {
  if (!quantity) {
    return "-";
  }
  return unit ? `${quantity} ${unit}` : quantity;
};

/**
 * 統計表示向けに数値文字列を整形する。
 */
const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "-";
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  const fixed = value.toFixed(2);
  return fixed.replace(TRAILING_DECIMAL_ZERO_PATTERN, "");
};

/**
 * 現在連続日数を算出する。
 */
const resolveCurrentStreak = (positiveDates: Set<string>): number => {
  let streak = 0;
  const currentDate = getTodayAtMidnight();

  while (positiveDates.has(formatPixelaDate(currentDate))) {
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

/**
 * 最長連続日数を算出する。
 */
const resolveLongestStreak = (positiveDates: Set<string>): number => {
  const sortedDates = [...positiveDates].sort();
  if (sortedDates.length === 0) {
    return 0;
  }

  let longestStreak = 1;
  let currentStreak = 1;

  for (let index = 1; index < sortedDates.length; index += 1) {
    const previousDate = parsePixelaDate(sortedDates[index - 1]);
    const currentDate = parsePixelaDate(sortedDates[index]);

    if (!(previousDate && currentDate)) {
      currentStreak = 1;
      continue;
    }

    const differenceInDays =
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);

    if (differenceInDays === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  return longestStreak;
};
