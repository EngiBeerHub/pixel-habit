import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { borderTokens, textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";
import type { GraphDetailSummary } from "../../../shared/lib/graph-detail-summary";
import { formatQuantityLabel } from "../../../shared/lib/graph-detail-summary";

interface KpiItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  testId: string;
  value: string;
}

/**
 * Graph DetailのKPIチップ行を描画する。
 */
export interface GraphDetailKpiSectionProps {
  graphUnit: string;
  summary: GraphDetailSummary;
}

export const GraphDetailKpiSection = ({
  graphUnit,
  summary,
}: GraphDetailKpiSectionProps) => {
  const items: KpiItem[] = [
    {
      icon: "bar-chart-outline",
      label: "累計",
      testId: "graph-detail-kpi-total",
      value: formatQuantityLabel(summary.totalQuantityText, graphUnit),
    },
    {
      icon: "trending-up-outline",
      label: "平均",
      testId: "graph-detail-kpi-average",
      value: formatQuantityLabel(summary.averagePerRecordedDayText, graphUnit),
    },
    {
      icon: "time-outline",
      label: "今日",
      testId: "graph-detail-kpi-today",
      value: formatQuantityLabel(summary.todayQuantityText, graphUnit),
    },
    {
      icon: "calendar-outline",
      label: "記録日",
      testId: "graph-detail-kpi-record",
      value: `${summary.positiveRecordCount}日`,
    },
  ];

  return (
    <View className="flex-row flex-wrap gap-2.5" testID="graph-detail-kpi-row">
      {items.map((item) => (
        <View
          className={mergeClassNames(
            "w-[48%] flex-row items-start gap-2 rounded-2xl border bg-stone-50 px-3 py-3",
            borderTokens.defaultClass
          )}
          key={item.testId}
          testID={item.testId}
        >
          <Ionicons
            color="#6b7280"
            name={item.icon}
            size={14}
            testID={`${item.testId}-icon`}
          />
          <View className="flex-1 gap-1">
            <Text
              className={mergeClassNames(
                "font-medium text-[11px]",
                textTokens.mutedClass
              )}
              testID={`${item.testId}-label`}
            >
              {item.label}
            </Text>
            <Text
              className={mergeClassNames(
                "font-semibold text-lg",
                textTokens.primaryClass
              )}
              testID={`${item.testId}-value`}
            >
              {item.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
