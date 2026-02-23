import { Pressable, Text, View } from "react-native";
import type { Pixel } from "../../../shared/api/pixel";
import { borderTokens, textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";
import { formatQuantityLabel } from "../../../shared/lib/graph-detail-summary";
import { toOptionalMemoPreview } from "../../../shared/lib/optional-data";
import { formatPixelaDateForDisplay } from "../../../shared/lib/pixela-date";

const RECORD_MEMO_PREVIEW_MAX_LENGTH = 24;

/**
 * Graph Detailの記録一覧セクション入力値。
 */
export interface GraphDetailRecordListProps {
  graphUnit: string;
  onPressRecord: (pixel: Pixel) => void;
  pixels: Pixel[];
}

/**
 * Graph Detailの期間内記録一覧を表示する。
 */
export const GraphDetailRecordList = ({
  graphUnit,
  onPressRecord,
  pixels,
}: GraphDetailRecordListProps) => {
  if (pixels.length === 0) {
    return (
      <Text className="text-neutral-600 text-sm">
        この期間の記録はまだありません。
      </Text>
    );
  }

  return (
    <View className="gap-2">
      {pixels.map((pixel) => {
        const memoPreview = toOptionalMemoPreview(
          pixel.optionalData,
          RECORD_MEMO_PREVIEW_MAX_LENGTH
        );
        return (
          <Pressable
            className={mergeClassNames(
              "rounded-xl border bg-neutral-50 px-3 py-3 active:opacity-80",
              borderTokens.defaultClass
            )}
            key={pixel.date}
            onPress={() => {
              onPressRecord(pixel);
            }}
            testID={`graph-detail-record-${pixel.date}`}
          >
            <View className="flex-row items-start justify-between gap-2">
              <Text
                className={mergeClassNames(
                  "font-medium text-sm",
                  textTokens.primaryClass
                )}
              >
                {formatPixelaDateForDisplay(pixel.date)}
              </Text>
              <Text
                className={mergeClassNames(
                  "text-sm",
                  textTokens.secondaryClass
                )}
              >
                {formatQuantityLabel(pixel.quantity, graphUnit)}
              </Text>
            </View>

            {memoPreview ? (
              <Text
                className={mergeClassNames(
                  "mt-2 text-xs",
                  textTokens.mutedClass
                )}
                numberOfLines={1}
                testID={`graph-detail-record-memo-${pixel.date}`}
              >
                {memoPreview}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};
