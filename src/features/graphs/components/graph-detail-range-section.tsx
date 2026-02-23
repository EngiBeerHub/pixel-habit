import { Tabs } from "heroui-native";
import { Text, View } from "react-native";
import { textTokens } from "../../../shared/config/ui-tokens";
import {
  type CalendarMode,
  formatCalendarModeLabel,
} from "../../../shared/lib/calendar-range";
import { mergeClassNames } from "../../../shared/lib/class-name";

/**
 * Graph Detailの期間切替セクションの入力値。
 */
export interface GraphDetailRangeSectionProps {
  mode: CalendarMode;
  onChangeMode: (mode: CalendarMode) => void;
  range: {
    from: string;
    to: string;
  };
}

/**
 * Month/Year切替と期間ラベルを表示するセクション。
 */
export const GraphDetailRangeSection = ({
  mode,
  onChangeMode,
  range,
}: GraphDetailRangeSectionProps) => {
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text
            className={mergeClassNames(
              "font-semibold text-sm",
              textTokens.primaryClass
            )}
          >
            表示範囲
          </Text>
          <Text
            className={mergeClassNames("text-xs", textTokens.mutedClass)}
            testID="graph-detail-mode-help"
          >
            Month=暦月 / Year=暦年
          </Text>
        </View>
      </View>

      <Tabs
        onValueChange={(value) => {
          if (value === "month" || value === "year") {
            onChangeMode(value);
          }
        }}
        value={mode}
        variant="primary"
      >
        <Tabs.List>
          <Tabs.Indicator />
          <Tabs.Trigger
            onPress={() => {
              onChangeMode("month");
            }}
            testID="graph-detail-mode-month"
            value="month"
          >
            <Tabs.Label>Month</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger
            onPress={() => {
              onChangeMode("year");
            }}
            testID="graph-detail-mode-year"
            value="year"
          >
            <Tabs.Label>Year</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="month" />
        <Tabs.Content value="year" />
      </Tabs>

      <Text className="text-neutral-700 text-sm" testID="graph-detail-range">
        {formatCalendarModeLabel(mode)}: {range.from} - {range.to}
      </Text>
    </View>
  );
};
