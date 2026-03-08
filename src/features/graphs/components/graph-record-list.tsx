import { Pressable, Text, View } from "react-native";
import type { Pixel } from "../../../shared/api/pixel";
import { borderTokens, textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";
import { formatQuantityLabel } from "../../../shared/lib/graph-detail-summary";
import { toOptionalMemoPreview } from "../../../shared/lib/optional-data";
import { formatPixelaDateForShortDisplay } from "../../../shared/lib/pixela-date";

const RECORD_MEMO_PREVIEW_MAX_LENGTH = 28;

export interface GraphRecordListProps {
  emptyMessage?: string;
  graphUnit: string;
  onPressRecord: (pixel: Pixel) => void;
  pixels: Pixel[];
  testID?: string;
}

/**
 * グラフ記録一覧の共通リスト表示。
 */
export const GraphRecordList = ({
  emptyMessage = "記録はまだありません。",
  graphUnit,
  onPressRecord,
  pixels,
  testID = "graph-record-list",
}: GraphRecordListProps) => {
  if (pixels.length === 0) {
    return (
      <View
        className={mergeClassNames(
          "rounded-2xl border bg-neutral-50 px-4 py-4",
          borderTokens.defaultClass
        )}
        testID={`${testID}-empty`}
      >
        <Text className={mergeClassNames("text-sm", textTokens.secondaryClass)}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-0" testID={testID}>
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
            testID={`${testID}-row-${pixel.date}`}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text
                  className={mergeClassNames(
                    "font-medium text-sm",
                    textTokens.primaryClass
                  )}
                >
                  {formatPixelaDateForShortDisplay(pixel.date)}
                </Text>
                {memoPreview ? (
                  <Text
                    className={mergeClassNames(
                      "text-xs",
                      textTokens.mutedClass
                    )}
                    numberOfLines={1}
                    testID={`${testID}-memo-${pixel.date}`}
                  >
                    {memoPreview}
                  </Text>
                ) : null}
              </View>

              <Text
                className={mergeClassNames(
                  "pt-0.5 font-medium text-sm",
                  textTokens.primaryClass
                )}
              >
                {formatQuantityLabel(pixel.quantity, graphUnit)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
