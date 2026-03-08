import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { borderTokens, textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";
import type { GraphDetailSummary } from "../../../shared/lib/graph-detail-summary";
import { formatQuantityLabel } from "../../../shared/lib/graph-detail-summary";

/**
 * Graph Detailの統計セクション入力値。
 */
export interface GraphDetailStatsSectionProps {
  graphUnit: string;
  summary: GraphDetailSummary;
}

/**
 * Graph Detailのハイライト統計をカード形式で描画する。
 */
export const GraphDetailStatsSection = ({
  graphUnit,
  summary,
}: GraphDetailStatsSectionProps) => {
  const streakItems = [
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
        "gap-3 rounded-3xl border bg-white p-4",
        borderTokens.defaultClass
      )}
      testID="graph-detail-stats"
    >
      <View className="flex-row items-center gap-2">
        <Ionicons color="#6b7280" name="flash-outline" size={14} />
        <Text
          className={mergeClassNames(
            "font-semibold text-[11px] uppercase tracking-[1px]",
            textTokens.mutedClass
          )}
        >
          ハイライト
        </Text>
      </View>

      <View className="gap-1">
        <Text className={mergeClassNames("text-[11px]", textTokens.mutedClass)}>
          最大
        </Text>
        <Text
          className={mergeClassNames(
            "font-bold text-3xl",
            textTokens.primaryClass
          )}
          testID="graph-detail-stat-max"
        >
          {formatQuantityLabel(summary.maxQuantityText, graphUnit)}
        </Text>
      </View>

      <View className="flex-row gap-2">
        {streakItems.map((item) => (
          <View
            className="flex-1 px-1 py-1"
            key={item.testID}
            testID={item.testID}
          >
            <Text
              className={mergeClassNames("text-[10px]", textTokens.mutedClass)}
            >
              {item.label}
            </Text>
            <Text
              className={mergeClassNames(
                "mt-1 font-semibold text-sm",
                textTokens.primaryClass
              )}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
