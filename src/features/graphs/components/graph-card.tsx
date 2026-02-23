import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Button, SkeletonGroup } from "heroui-native";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuthedPixelaApi } from "../../../shared/api/authed-pixela-api";
import type { GraphDefinition } from "../../../shared/api/graph";
import { queryKeys } from "../../../shared/api/query-keys";
import { surfaceTokens, textTokens } from "../../../shared/config/ui-tokens";
import { getGraphThemeColor } from "../../../shared/lib/graph-theme";
import { SectionCard } from "../../../shared/ui/section-card";
import { CompactHeatmap, getCompactHeatmapDateRange } from "./compact-heatmap";

const COMPACT_HEATMAP_WEEKS = 14;

/**
 * グラフカード描画に必要な入力値。
 */
export interface GraphCardProps {
  graph: GraphDefinition;
  isActionDisabled: boolean;
  onPressAddForDate: (graph: GraphDefinition, date: string) => void;
  onPressAddToday: (graph: GraphDefinition) => void;
  onPressOpenDetail: (graph: GraphDefinition) => void;
}

/**
 * グラフ1件分のカードを描画し、カード単位で14週ヒートマップを取得する。
 */
const GraphCardBase = ({
  graph,
  isActionDisabled,
  onPressAddForDate,
  onPressAddToday,
  onPressOpenDetail,
}: GraphCardProps) => {
  const api = useAuthedPixelaApi();
  const compactHeatmapRange = getCompactHeatmapDateRange(COMPACT_HEATMAP_WEEKS);

  const pixelQuery = useQuery({
    enabled: api.isAuthenticated,
    queryFn: () => {
      return api.getPixels({
        from: compactHeatmapRange.from,
        graphId: graph.id,
        to: compactHeatmapRange.to,
      });
    },
    queryKey: queryKeys.graphPixelsCompact(
      api.username,
      graph.id,
      compactHeatmapRange.from,
      compactHeatmapRange.to
    ),
  });

  /**
   * Compactカード内でピクセル一覧を再取得する。
   */
  const onRetryPixels = () => {
    pixelQuery.refetch();
  };

  return (
    <SectionCard className="mb-4">
      <View className="relative">
        <View className="absolute top-1 right-1 z-10">
          <Button
            className={surfaceTokens.accentSubtleClass}
            isDisabled={isActionDisabled}
            isIconOnly
            onPress={() => {
              onPressAddToday(graph);
            }}
            size="sm"
            testID={`graph-card-add-today-${graph.id}`}
            variant="tertiary"
          >
            <Ionicons name="add" size={16} />
          </Button>
        </View>
        <Pressable
          onPress={() => {
            onPressOpenDetail(graph);
          }}
          testID={`graph-card-open-detail-${graph.id}`}
        >
          {/* グラフ基本情報 */}
          <View className="mb-2 min-h-10 flex-row items-center gap-2 pr-12">
            <View
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: getGraphThemeColor(graph.color),
              }}
            />
            <Text
              className={`font-semibold text-lg ${textTokens.primaryClass}`}
            >
              {graph.name}
            </Text>
          </View>
          <View>
            {/* カード内ヒートマップ取得中のプレースホルダー */}
            {pixelQuery.isPending ? (
              <View
                className="mt-3"
                testID={`graph-card-loading-skeleton-${graph.id}`}
              >
                <SkeletonGroup className="gap-2" isSkeletonOnly>
                  <SkeletonGroup.Item className="h-3 w-24 rounded-full" />
                  <SkeletonGroup.Item className="h-24 w-full rounded-lg" />
                </SkeletonGroup>
              </View>
            ) : null}
            {/* カード単位エラー。再取得だけを局所的に実行する */}
            {!pixelQuery.isPending && pixelQuery.error ? (
              <View className="mt-3 rounded-lg p-3">
                <Text className="mb-2 text-red-600 text-sm">
                  ヒートマップの取得に失敗しました。
                </Text>
                <Button onPress={onRetryPixels}>再取得</Button>
              </View>
            ) : null}
            {/* 取得成功時のみヒートマップを描画 */}
            {pixelQuery.isPending || pixelQuery.error ? null : (
              <CompactHeatmap
                graphColor={graph.color}
                onPressCell={(date) => {
                  onPressAddForDate(graph, date);
                }}
                pixels={pixelQuery.data ?? []}
                weeks={COMPACT_HEATMAP_WEEKS}
              />
            )}
          </View>
        </Pressable>
      </View>
    </SectionCard>
  );
};

/**
 * Home一覧の不要な再描画を抑えるため、GraphCardをメモ化する。
 */
export const GraphCard = memo(GraphCardBase);
GraphCard.displayName = "GraphCard";
