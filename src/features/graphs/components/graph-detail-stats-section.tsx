import { Text, View } from "react-native";
import { textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";
import type { GraphDetailSummary } from "../../../shared/lib/graph-detail-summary";

/**
 * Graph Detailの統計セクション入力値。
 */
export interface GraphDetailStatsSectionProps {
  summary: GraphDetailSummary;
}

/**
 * Graph Detailの統計情報を描画するセクション。
 */
export const GraphDetailStatsSection = ({
  summary,
}: GraphDetailStatsSectionProps) => {
  return (
    <View className="gap-1">
      <Text
        className={mergeClassNames("font-semibold", textTokens.primaryClass)}
      >
        統計
      </Text>
      <Text className="text-neutral-700 text-sm">
        合計: {summary.totalQuantityText}
      </Text>
      <Text className="text-neutral-700 text-sm">
        記録日数: {summary.positiveRecordCount}
      </Text>
      <Text className="text-neutral-700 text-sm">
        最大: {summary.maxQuantityText}
      </Text>
      <Text className="text-neutral-700 text-sm">
        平均(記録日): {summary.averagePerRecordedDayText}
      </Text>
      <Text className="text-neutral-700 text-sm">
        現在連続日数: {summary.currentStreakDays}
      </Text>
      <Text className="text-neutral-700 text-sm">
        最長連続日数: {summary.longestStreakDays}
      </Text>
    </View>
  );
};
