import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";

export interface GraphDetailRecordLinkProps {
  onPress: () => void;
}

/**
 * Graph Detail から記録一覧へ遷移するための最小CTA。
 */
export const GraphDetailRecordLink = ({
  onPress,
}: GraphDetailRecordLinkProps) => {
  return (
    <Pressable
      className="active:opacity-80"
      onPress={onPress}
      testID="graph-detail-record-link"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className={mergeClassNames(
            "font-semibold text-base",
            textTokens.primaryClass
          )}
        >
          記録一覧を見る
        </Text>
        <Ionicons color="#6b7280" name="chevron-forward" size={16} />
      </View>
    </Pressable>
  );
};
