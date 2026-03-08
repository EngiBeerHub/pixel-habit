import { Text, View } from "react-native";
import { borderTokens, textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";
import type { GraphDetailSummary } from "../../../shared/lib/graph-detail-summary";

/**
 * Graph Detailの統計セクション入力値。
 */
export interface GraphDetailStatsSectionProps {
  summary: GraphDetailSummary;
}

/**
 * Graph Detailの補助統計をコンパクトなグリッドで描画する。
 */
export const GraphDetailStatsSection = ({
  summary,
}: GraphDetailStatsSectionProps) => {
  const items = [
    {
      label: "最大",
      testID: "graph-detail-stat-max",
      value: summary.maxQuantityText,
    },
    {
      label: "現在連続",
      testID: "graph-detail-stat-current-streak",
      value: `${summary.currentStreakDays}日`,
    },
    {
      label: "最長連続",
      testID: "graph-detail-stat-longest-streak",
      value: `${summary.longestStreakDays}日`,
    },
  ];

  return (
    <View className="flex-row gap-2" testID="graph-detail-stats">
      {items.map((item) => (
        <View
          className={mergeClassNames(
            "flex-1 rounded-2xl border bg-neutral-50 px-3 py-3",
            borderTokens.defaultClass
          )}
          key={item.testID}
          testID={item.testID}
        >
          <Text
            className={mergeClassNames("text-[11px]", textTokens.mutedClass)}
          >
            {item.label}
          </Text>
          <Text
            className={mergeClassNames(
              "mt-1 font-semibold text-base",
              textTokens.primaryClass
            )}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
};
