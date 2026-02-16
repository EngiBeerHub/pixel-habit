import { Pressable, Text, View } from "react-native";
import type { GraphDefinition } from "../../../shared/api/graph";
import type { Pixel } from "../../../shared/api/pixel";
import { heatmapTokens } from "../../../shared/config/ui-tokens";
import { getGraphThemeColor } from "../../../shared/lib/graph-theme";

const DAYS_PER_WEEK = 7;
const DEFAULT_WEEKS = 14;
const CELL_SIZE = heatmapTokens.cellSize;
const CELL_GAP = heatmapTokens.cellGap;
const LABEL_WIDTH = heatmapTokens.labelWidth;
const ROW_KEYS = [
  "row-0",
  "row-1",
  "row-2",
  "row-3",
  "row-4",
  "row-5",
  "row-6",
];

/**
 * Compactヒートマップの入力値。
 */
export interface CompactHeatmapProps {
  graphColor: GraphDefinition["color"];
  onPressCell?: (date: string) => void;
  pixels: Pixel[];
  weeks?: number;
}

/**
 * Compactヒートマップ取得/描画で共通利用する日付範囲。
 */
export interface CompactHeatmapDateRange {
  from: string;
  to: string;
}

/**
 * Compactヒートマップのセル情報。
 */
interface HeatmapCell {
  date: string;
  isFutureDate: boolean;
  level: number;
}

/**
 * Compactヒートマップの1行分データ。
 */
interface HeatmapRow {
  cells: HeatmapCell[];
  id: string;
}

/**
 * 取得と描画を一致させるため、Compactヒートマップの対象期間を返す。
 */
export const getCompactHeatmapDateRange = (
  weeks = DEFAULT_WEEKS
): CompactHeatmapDateRange => {
  const today = getTodayDate();
  const startDate = resolveStartDate(today, weeks);
  return {
    from: formatDate(startDate),
    to: formatDate(today),
  };
};

/**
 * Compact表示向けに、直近期間の記録を7xNグリッドで描画する。
 */
export const CompactHeatmap = ({
  graphColor,
  onPressCell,
  pixels,
  weeks = DEFAULT_WEEKS,
}: CompactHeatmapProps) => {
  const today = getTodayDate();
  const startDate = resolveStartDate(today, weeks);
  const baseColor = getGraphThemeColor(graphColor);
  const monthLabels = buildMonthLabels(startDate, weeks);
  const rows = buildHeatmapRows({
    pixels,
    startDate,
    today,
    weeks,
  });

  return (
    <View className="mt-3 items-center">
      <View style={{ width: calculateGridWidth(weeks) }}>
        {/* 上段: 週カラムに対応した月ラベル */}
        <View
          className="mb-1 flex-row"
          style={{ width: calculateGridWidth(weeks) }}
        >
          {monthLabels.map((label) => (
            <View
              className="items-center"
              key={`month-${label.weekIndex}`}
              style={{
                marginRight: label.weekIndex === weeks - 1 ? 0 : CELL_GAP,
                width: CELL_SIZE,
              }}
            >
              <Text className="text-center text-[10px] text-neutral-500">
                {label.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ width: calculateGridWidth(weeks) }}>
          {/* 左側: 曜日ラベル。グリッドの左外側へ重ねて配置する */}
          <View
            className="absolute"
            style={{
              left: -(LABEL_WIDTH + CELL_GAP),
              rowGap: CELL_GAP,
              top: 0,
              width: LABEL_WIDTH,
            }}
          >
            {rows.map((row, rowIndex) => (
              <View
                className="items-end justify-center"
                key={`weekday-${row.id}`}
                style={{ height: CELL_SIZE }}
              >
                <Text className="text-[10px] text-neutral-500">
                  {resolveWeekdayLabel(rowIndex)}
                </Text>
              </View>
            ))}
          </View>

          {/* 本体: 7行xN列のヒートマップセル */}
          <View style={{ rowGap: CELL_GAP }}>
            {rows.map((row) => (
              <View
                className="flex-row"
                key={row.id}
                style={{ columnGap: CELL_GAP }}
              >
                {row.cells.map((cell) => (
                  <Pressable
                    key={cell.date}
                    onPress={(event) => {
                      event?.stopPropagation?.();
                      if (cell.isFutureDate) {
                        return;
                      }
                      onPressCell?.(cell.date);
                    }}
                    style={({ pressed }) => ({
                      borderRadius: 3,
                      opacity: pressed && !cell.isFutureDate ? 0.72 : 1,
                    })}
                    testID={`compact-heatmap-cell-${cell.date}`}
                  >
                    <View
                      style={{
                        backgroundColor: resolveCellColor({
                          baseColor,
                          level: cell.level,
                        }),
                        borderRadius: 3,
                        height: CELL_SIZE,
                        width: CELL_SIZE,
                      }}
                    />
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * 今日の日付を時刻情報なしで返す。
 */
const getTodayDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * 指定日を含む週の先頭（日曜）を返す。
 */
const getStartOfWeek = (date: Date): Date => {
  const normalized = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  normalized.setDate(normalized.getDate() - normalized.getDay());
  return normalized;
};

/**
 * ヒートマップ開始日を週数から計算する。
 */
const resolveStartDate = (today: Date, weeks: number): Date => {
  const currentWeekStart = getStartOfWeek(today);
  const startDate = new Date(currentWeekStart);
  startDate.setDate(currentWeekStart.getDate() - (weeks - 1) * DAYS_PER_WEEK);
  return startDate;
};

/**
 * 週カラムごとの月ラベルを生成する。
 */
const buildMonthLabels = (
  startDate: Date,
  weeks: number
): Array<{ label: string; weekIndex: number }> => {
  const labels: Array<{ label: string; weekIndex: number }> = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    const weekStartDate = addDays(startDate, weekIndex * DAYS_PER_WEEK);
    const previousWeekStartDate = addDays(
      startDate,
      (weekIndex - 1) * DAYS_PER_WEEK
    );
    const shouldShowLabel =
      weekIndex === 0 ||
      weekStartDate.getMonth() !== previousWeekStartDate.getMonth();

    labels.push({
      label: shouldShowLabel ? formatMonthLabel(weekStartDate) : "",
      weekIndex,
    });
  }

  return labels;
};

/**
 * 描画対象期間のセル情報を日付グリッドへ変換する。
 */
const buildHeatmapRows = ({
  pixels,
  startDate,
  today,
  weeks,
}: {
  pixels: Pixel[];
  startDate: Date;
  today: Date;
  weeks: number;
}): HeatmapRow[] => {
  const quantityByDate = createQuantityMap(pixels);
  const positiveValues = Array.from(quantityByDate.values()).filter(
    (value) => value > 0
  );
  const maxQuantity =
    positiveValues.length > 0 ? Math.max(...positiveValues) : 0;

  return Array.from({ length: DAYS_PER_WEEK }, (_, rowIndex) => ({
    cells: Array.from({ length: weeks }, (_, weekIndex) => {
      const date = addDays(startDate, weekIndex * DAYS_PER_WEEK + rowIndex);
      const yyyyMmDd = formatDate(date);
      const isFutureDate = date.getTime() > today.getTime();
      const quantity = isFutureDate ? 0 : (quantityByDate.get(yyyyMmDd) ?? 0);

      return {
        date: yyyyMmDd,
        isFutureDate,
        level: resolveLevel(quantity, maxQuantity),
      };
    }),
    id: ROW_KEYS[rowIndex] ?? `row-${rowIndex}`,
  }));
};

/**
 * 指定日数を加算した新しい日付を返す。
 */
const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
};

/**
 * 週数に応じたヒートマップ描画領域の横幅を返す。
 */
const calculateGridWidth = (weeks: number): number => {
  if (weeks <= 0) {
    return 0;
  }
  return weeks * CELL_SIZE + (weeks - 1) * CELL_GAP;
};

/**
 * ピクセル配列を日付キーの数値マップへ正規化する。
 */
const createQuantityMap = (pixels: Pixel[]): Map<string, number> => {
  const quantityByDate = new Map<string, number>();

  for (const pixel of pixels) {
    const parsedQuantity = Number(pixel.quantity);
    quantityByDate.set(
      pixel.date,
      Number.isFinite(parsedQuantity) ? parsedQuantity : 0
    );
  }

  return quantityByDate;
};

/**
 * 量を5段階のヒートマップレベルへ変換する。
 */
const resolveLevel = (value: number, maxQuantity: number): number => {
  if (value <= 0 || maxQuantity <= 0) {
    return 0;
  }

  const ratio = value / maxQuantity;
  if (ratio <= 0.25) {
    return 1;
  }
  if (ratio <= 0.5) {
    return 2;
  }
  if (ratio <= 0.75) {
    return 3;
  }
  return 4;
};

/**
 * レベルに応じてセル背景色を決定する。
 */
const resolveCellColor = ({
  baseColor,
  level,
}: {
  baseColor: string;
  level: number;
}): string => {
  if (level <= 0) {
    return heatmapTokens.emptyColor;
  }
  return toRgba(baseColor, 0.18 + level * 0.2);
};

/**
 * 16進カラーを透明度付きRGBAへ変換する。
 */
const toRgba = (hexColor: string, alpha: number): string => {
  const normalizedHex = hexColor.replace("#", "");
  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.min(alpha, 1)})`;
};

/**
 * 日付をPixela日付形式に変換する。
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

/**
 * 月表示ラベルへ変換する。
 */
const formatMonthLabel = (date: Date): string => {
  return `${date.getMonth() + 1}\n月`;
};

/**
 * GitHub風の曜日表示（Mon, Wed, Fri）を返す。
 */
const resolveWeekdayLabel = (rowIndex: number): string => {
  if (rowIndex === 1) {
    return "Mon";
  }
  if (rowIndex === 3) {
    return "Wed";
  }
  if (rowIndex === 5) {
    return "Fri";
  }
  return "";
};
