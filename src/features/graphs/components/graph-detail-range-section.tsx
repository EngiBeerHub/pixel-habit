import { Tabs } from "heroui-native";
import { Text, View } from "react-native";
import { textTokens } from "../../../shared/config/ui-tokens";
import {
  type CalendarMode,
  formatGraphDetailModeLabel,
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
            Short=14週 / Full=53週
          </Text>
        </View>
      </View>

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

      <Text className="text-neutral-700 text-sm" testID="graph-detail-range">
        {formatGraphDetailModeLabel(mode)}: {range.from} - {range.to}
      </Text>
    </View>
  );
};
