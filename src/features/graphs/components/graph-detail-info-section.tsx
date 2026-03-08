import { Text, View } from "react-native";
import { borderTokens, textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";

/**
 * Graph Detailのグラフ情報セクション入力値。
 */
export interface GraphDetailInfoSectionProps {
  graphId: string;
  timezone: string;
  unit: string;
}

/**
 * Graph情報（ID/単位/タイムゾーン）を補助情報として表示する。
 */
export const GraphDetailInfoSection = ({
  graphId,
  timezone,
  unit,
}: GraphDetailInfoSectionProps) => {
  const items = [
    {
      label: "ID",
      testID: "graph-detail-info-id",
      value: graphId || "-",
    },
    {
      label: "単位",
      testID: "graph-detail-info-unit",
      value: unit || "-",
    },
    {
      label: "TZ",
      testID: "graph-detail-info-timezone",
      value: timezone || "-",
    },
  ];

  return (
    <View className="flex-row gap-2" testID="graph-detail-info">
      {items.map((item) => (
        <View
          className={mergeClassNames(
            "flex-1 rounded-2xl border bg-neutral-50 px-3 py-2",
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
              "mt-1 font-medium text-sm",
              textTokens.secondaryClass
            )}
            numberOfLines={1}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
};
