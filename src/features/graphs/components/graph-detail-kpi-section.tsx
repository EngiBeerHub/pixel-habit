import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { borderTokens, textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";
import type { GraphDetailSummary } from "../../../shared/lib/graph-detail-summary";

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
  summary: GraphDetailSummary;
}

export const GraphDetailKpiSection = ({
  summary,
}: GraphDetailKpiSectionProps) => {
  const items: KpiItem[] = [
    {
      icon: "calendar-outline",
      label: "記録",
      testId: "graph-detail-kpi-record",
      value: String(summary.positiveRecordCount),
    },
    {
      icon: "bar-chart-outline",
      label: "累計",
      testId: "graph-detail-kpi-total",
      value: summary.totalQuantityText,
    },
    {
      icon: "trending-up-outline",
      label: "平均",
      testId: "graph-detail-kpi-average",
      value: summary.averagePerRecordedDayText,
    },
    {
      icon: "radio-button-on-outline",
      label: "今日",
      testId: "graph-detail-kpi-today",
      value: summary.todayQuantityText,
    },
  ];

  return (
    <View className="flex-row gap-2" testID="graph-detail-kpi-row">
      {items.map((item) => (
        <View
          className={mergeClassNames(
            "flex-1 flex-row items-center gap-1 rounded-2xl border bg-neutral-50 px-2 py-2",
            borderTokens.defaultClass
          )}
          key={item.testId}
          testID={item.testId}
        >
          <Ionicons
            color="#111827"
            name={item.icon}
            size={14}
            testID={`${item.testId}-icon`}
          />
          <View className="flex-1">
            <Text
              className={mergeClassNames(
                "font-semibold text-xs",
                textTokens.primaryClass
              )}
              testID={`${item.testId}-value`}
            >
              {item.value}
            </Text>
            <Text
              className={mergeClassNames("text-[10px]", textTokens.mutedClass)}
              testID={`${item.testId}-label`}
            >
              {item.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
