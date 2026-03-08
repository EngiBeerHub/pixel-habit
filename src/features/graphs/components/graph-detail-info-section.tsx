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
 * Graph情報（ID/単位/タイムゾーン）を grouped row 形式で表示する。
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
    <View
      className={mergeClassNames(
        "overflow-hidden rounded-2xl border bg-neutral-50",
        borderTokens.defaultClass
      )}
      testID="graph-detail-info"
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
            className={mergeClassNames(
              "font-medium text-[11px] uppercase",
              textTokens.mutedClass
            )}
          >
            {item.label}
          </Text>
          <Text
            className={mergeClassNames(
              "flex-1 text-right text-sm",
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
