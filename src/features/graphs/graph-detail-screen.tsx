import { Button } from "heroui-native";
import { ActivityIndicator, Text, View } from "react-native";
import {
  borderTokens,
  surfaceTokens,
  textTokens,
} from "../../shared/config/ui-tokens";
import { mergeClassNames } from "../../shared/lib/class-name";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";
import { CompactHeatmap } from "./components/compact-heatmap";
import { GraphDetailInfoSection } from "./components/graph-detail-info-section";
import { GraphDetailKpiSection } from "./components/graph-detail-kpi-section";
import { GraphDetailRangeSection } from "./components/graph-detail-range-section";
import { GraphDetailRecordList } from "./components/graph-detail-record-list";
import { GraphDetailStatsSection } from "./components/graph-detail-stats-section";
import { useGraphDetailScreen } from "./hooks/use-graph-detail-screen";

const GRAPH_COLORS = [
  "ajisai",
  "ichou",
  "kuro",
  "momiji",
  "shibafu",
  "sora",
] as const;

const resolveGraphColor = (color: string): (typeof GRAPH_COLORS)[number] => {
  if (GRAPH_COLORS.includes(color as (typeof GRAPH_COLORS)[number])) {
    return color as (typeof GRAPH_COLORS)[number];
  }
  return "shibafu";
};

/**
 * Graph詳細画面。ヒートマップ中心の detail page として記録・統計・管理導線を表示する。
 */
export const GraphDetailScreen = () => {
  const {
    activeRange,
    errorMessage,
    graphColor,
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
  const resolvedColor = resolveGraphColor(graphColor);
  const hasResolvedData = query.data !== undefined;
  const isInitialLoading = query.isPending && !hasResolvedData;

  return (
    <ScreenContainer
      contentClassName={mergeClassNames("gap-5", surfaceTokens.screenClass)}
      scrollable
      withTopInset={false}
    >
      {/* データ取得中 */}
      {isInitialLoading ? (
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
          className={mergeClassNames(
            "rounded-3xl border",
            borderTokens.dangerClass
          )}
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
      {isInitialLoading || errorMessage ? null : (
        <View className="gap-5">
          {/* 主表示: 期間切替・ヒートマップ・主要KPI */}
          <SectionCard
            className={mergeClassNames(
              "rounded-3xl border border-neutral-200 bg-white"
            )}
          >
            <View className="gap-5">
              <GraphDetailRangeSection
                mode={mode}
                onChangeMode={onChangeMode}
                range={activeRange}
              />

              <CompactHeatmap
                graphColor={resolvedColor}
                pixels={pixels}
                weeks={activeRange.weeks}
              />

              <GraphDetailKpiSection graphUnit={graphUnit} summary={summary} />
            </View>
          </SectionCard>

          {/* 補助情報: グラフ情報と補助統計 */}
          <View className="gap-4" testID="graph-detail-meta-block">
            <GraphDetailStatsSection graphUnit={graphUnit} summary={summary} />
            <GraphDetailInfoSection
              graphId={graphId}
              timezone={graphTimezone}
              unit={graphUnit}
            />
          </View>

          {/* 下位情報: 記録一覧 */}
          <SectionCard
            className={mergeClassNames(
              "rounded-3xl border border-neutral-200 bg-white"
            )}
          >
            <View className="gap-3">
              <Text
                className={mergeClassNames(
                  "font-semibold text-base",
                  textTokens.primaryClass
                )}
              >
                最近の記録
              </Text>

              <GraphDetailRecordList
                graphUnit={graphUnit}
                onPressRecord={onPressOpenPixelDetail}
                pixels={pixels}
              />
            </View>
          </SectionCard>
        </View>
      )}
    </ScreenContainer>
  );
};
