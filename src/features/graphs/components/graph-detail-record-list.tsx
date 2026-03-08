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
 * Graph Detailの期間内記録一覧を grouped list 形式で表示する。
 */
export const GraphDetailRecordList = ({
  graphUnit,
  onPressRecord,
  pixels,
}: GraphDetailRecordListProps) => {
  if (pixels.length === 0) {
    return (
      <View
        className={mergeClassNames(
          "rounded-2xl border bg-neutral-50 px-4 py-4",
          borderTokens.defaultClass
        )}
        testID="graph-detail-record-list-empty"
      >
        <Text className={mergeClassNames("text-sm", textTokens.secondaryClass)}>
          この期間の記録はまだありません。
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-0" testID="graph-detail-record-list">
      {pixels.map((pixel, index) => {
        const memoPreview = toOptionalMemoPreview(
          pixel.optionalData,
          RECORD_MEMO_PREVIEW_MAX_LENGTH
        );
        return (
          <Pressable
            className={mergeClassNames(
              "px-1 py-3 active:opacity-80",
              index === 0 ? undefined : "border-neutral-100 border-t"
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
                className={mergeClassNames("text-sm", textTokens.mutedClass)}
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
