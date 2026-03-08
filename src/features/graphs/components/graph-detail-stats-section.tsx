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
 * Graph Detailの補助統計を grouped row 形式で描画する。
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
    <View
      className={mergeClassNames(
        "overflow-hidden rounded-2xl border bg-neutral-50",
        borderTokens.defaultClass
      )}
      testID="graph-detail-stats"
    >
      {items.map((item, index) => (
        <View
          className={mergeClassNames(
            "flex-row items-center justify-between gap-3 px-4 py-3",
            index === 0
              ? undefined
              : mergeClassNames("border-t", borderTokens.defaultClass)
          )}
          key={item.testID}
          testID={item.testID}
        >
          <Text
            className={mergeClassNames("text-sm", textTokens.secondaryClass)}
          >
            {item.label}
          </Text>
          <Text
            className={mergeClassNames(
              "font-semibold text-sm",
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
