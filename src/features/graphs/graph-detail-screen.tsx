import { Button } from "heroui-native";
import { ActivityIndicator, Text, View } from "react-native";
import { borderTokens, textTokens } from "../../shared/config/ui-tokens";
import { mergeClassNames } from "../../shared/lib/class-name";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";
import { GraphDetailInfoSection } from "./components/graph-detail-info-section";
import { GraphDetailRangeSection } from "./components/graph-detail-range-section";
import { GraphDetailRecordList } from "./components/graph-detail-record-list";
import { GraphDetailStatsSection } from "./components/graph-detail-stats-section";
import { useGraphDetailScreen } from "./hooks/use-graph-detail-screen";

/**
 * Graph詳細画面。Month/Yearで記録を確認する。
 */
export const GraphDetailScreen = () => {
  const {
    activeRange,
    errorMessage,
    graphId,
    graphTimezone,
    graphUnit,
    mode,
    onChangeMode,
    onPressOpenPixelDetail,
    pixels,
    query,
    summary,
  } = useGraphDetailScreen();

  return (
    <ScreenContainer contentClassName="gap-4" scrollable withTopInset={false}>
      <SectionCard>
        <View className="gap-4">
          <GraphDetailRangeSection
            mode={mode}
            onChangeMode={onChangeMode}
            range={activeRange}
          />
          <GraphDetailInfoSection
            graphId={graphId}
            timezone={graphTimezone}
            unit={graphUnit}
          />
        </View>
      </SectionCard>

      {/* データ取得中 */}
      {query.isPending ? (
        <View className="items-center justify-center py-6">
          <ActivityIndicator />
          <Text className={mergeClassNames("mt-2", textTokens.secondaryClass)}>
            読み込み中...
          </Text>
        </View>
      ) : null}

      {/* 取得失敗時の表示 */}
      {!query.isPending && errorMessage ? (
        <SectionCard
          className={mergeClassNames("border", borderTokens.dangerClass)}
          tone="danger"
        >
          <View className="gap-3">
            <Text
              className={mergeClassNames("text-sm", textTokens.dangerClass)}
            >
              {errorMessage}
            </Text>
            <Button
              onPress={() => {
                query.refetch();
              }}
              size="sm"
              testID="graph-detail-retry"
              variant="secondary"
            >
              再試行
            </Button>
          </View>
        </SectionCard>
      ) : null}

      {/* 取得成功時の統計と記録一覧 */}
      {query.isPending || errorMessage ? null : (
        <SectionCard>
          <View className="gap-4">
            <GraphDetailStatsSection summary={summary} />

            <View
              className={mergeClassNames(
                "border-t pt-2",
                borderTokens.defaultClass
              )}
            >
              <Text
                className={mergeClassNames(
                  "font-semibold",
                  textTokens.primaryClass
                )}
              >
                記録一覧
              </Text>
            </View>

            <GraphDetailRecordList
              graphUnit={graphUnit}
              onPressRecord={onPressOpenPixelDetail}
              pixels={pixels}
            />
          </View>
        </SectionCard>
      )}
    </ScreenContainer>
  );
};
