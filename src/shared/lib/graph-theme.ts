import type { GraphDefinition } from "../api/graph";

/**
 * Pixelaの色名をUIで使うテーマ色へ変換するマップ。
 */
const GRAPH_THEME_COLOR_MAP: Record<GraphDefinition["color"], string> = {
  ajisai: "#7c3aed",
  ichou: "#ca8a04",
  kuro: "#171717",
  momiji: "#dc2626",
  shibafu: "#16a34a",
  sora: "#0284c7",
};

/**
 * グラフ色定義からUI表示用の16進カラーコードを返す。
 */
export const getGraphThemeColor = (color: GraphDefinition["color"]): string => {
  return GRAPH_THEME_COLOR_MAP[color];
};
