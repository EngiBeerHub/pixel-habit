import { Tabs } from "heroui-native";
import { Text, View } from "react-native";
import { textTokens } from "../../../shared/config/ui-tokens";
import type { CalendarMode } from "../../../shared/lib/calendar-range";
import { mergeClassNames } from "../../../shared/lib/class-name";
import { formatPixelaDateForShortDisplay } from "../../../shared/lib/pixela-date";

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
 * Short/Full切替と日付範囲を表示するセクション。
 */
export const GraphDetailRangeSection = ({
  mode,
  onChangeMode,
  range,
}: GraphDetailRangeSectionProps) => {
  return (
    <View className="gap-3">
      <Tabs
        onValueChange={(value) => {
          if (value === "short" || value === "full") {
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
              onChangeMode("short");
            }}
            testID="graph-detail-mode-short"
            value="short"
          >
            <Tabs.Label>Short</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger
            onPress={() => {
              onChangeMode("full");
            }}
            testID="graph-detail-mode-full"
            value="full"
          >
            <Tabs.Label>Full</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="short" />
        <Tabs.Content value="full" />
      </Tabs>

      <View className="gap-1">
        <Text
          className={mergeClassNames(
            "font-semibold text-[11px] uppercase tracking-[1px]",
            textTokens.mutedClass
          )}
        >
          期間
        </Text>
        <Text
          className={mergeClassNames(
            "font-semibold text-xl",
            textTokens.primaryClass
          )}
          testID="graph-detail-range"
        >
          {formatPixelaDateForShortDisplay(range.from)} -{" "}
          {formatPixelaDateForShortDisplay(range.to)}
        </Text>
      </View>
    </View>
  );
};
