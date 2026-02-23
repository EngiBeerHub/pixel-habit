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
 * Graph情報（ID/単位/タイムゾーン）を表示するセクション。
 */
export const GraphDetailInfoSection = ({
  graphId,
  timezone,
  unit,
}: GraphDetailInfoSectionProps) => {
  return (
    <View
      className={mergeClassNames(
        "gap-1 rounded-xl border bg-neutral-50 px-3 py-3",
        borderTokens.defaultClass
      )}
      testID="graph-detail-info"
    >
      <Text className={mergeClassNames("text-xs", textTokens.mutedClass)}>
        グラフ情報
      </Text>
      <Text className={mergeClassNames("text-sm", textTokens.secondaryClass)}>
        ID: {graphId || "-"}
      </Text>
      <Text className={mergeClassNames("text-sm", textTokens.secondaryClass)}>
        単位: {unit || "-"}
      </Text>
      <Text className={mergeClassNames("text-sm", textTokens.secondaryClass)}>
        タイムゾーン: {timezone || "-"}
      </Text>
    </View>
  );
};
