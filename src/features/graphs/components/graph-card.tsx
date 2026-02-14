import { useQuery } from "@tanstack/react-query";
import { Button } from "heroui-native";
import { Text, View } from "react-native";
import { useAuthedPixelaApi } from "../../../shared/api/authed-pixela-api";
import type { GraphDefinition } from "../../../shared/api/graph";
import { getGraphThemeColor } from "../../../shared/lib/graph-theme";
import { ActionStack } from "../../../shared/ui/action-stack";
import { InlineMessage } from "../../../shared/ui/inline-message";
import { SectionCard } from "../../../shared/ui/section-card";
import { CompactHeatmap, getCompactHeatmapDateRange } from "./compact-heatmap";

const COMPACT_HEATMAP_WEEKS = 14;

/**
 * グラフカード描画に必要な入力値。
 */
export interface GraphCardProps {
  graph: GraphDefinition;
  isActionDisabled: boolean;
  onPressAddPixel: (graph: GraphDefinition) => void;
  onPressGraphMenu: (graph: GraphDefinition) => void;
  onPressOpenPixels: (graph: GraphDefinition) => void;
}

/**
 * グラフ1件分のカードを描画し、カード単位で14週ヒートマップを取得する。
 */
export const GraphCard = ({
  graph,
  isActionDisabled,
  onPressAddPixel,
  onPressGraphMenu,
  onPressOpenPixels,
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
    queryKey: [
      "graphPixelsCompact",
      api.username,
      graph.id,
      compactHeatmapRange.from,
      compactHeatmapRange.to,
    ],
  });

  /**
   * Compactカード内でピクセル一覧を再取得する。
   */
  const onRetryPixels = () => {
    pixelQuery.refetch();
  };

  return (
    <SectionCard className="mb-3">
      {/* カード上部: タイトルと操作メニュー */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <View className="mb-2 flex-row items-center gap-2">
            <View
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: getGraphThemeColor(graph.color),
              }}
            />
            <Text className="font-semibold text-lg text-neutral-900">
              {graph.name}
            </Text>
          </View>
        </View>
        <Button
          isDisabled={isActionDisabled}
          onPress={() => {
            onPressGraphMenu(graph);
          }}
        >
          ...
        </Button>
      </View>
      {/* グラフ基本情報 */}
      <Text className="mt-1 text-neutral-600">ID: {graph.id}</Text>
      <Text className="text-neutral-600">
        単位: {graph.unit} / タイムゾーン: {graph.timezone}
      </Text>
      <View>
        {/* カード内ヒートマップ取得中のプレースホルダー */}
        {pixelQuery.isLoading ? (
          <InlineMessage
            className="mt-3"
            message="記録を読み込み中..."
            variant="info"
          />
        ) : null}
        {/* カード単位エラー。再取得だけを局所的に実行する */}
        {!pixelQuery.isLoading && pixelQuery.error ? (
          <View className="mt-3 rounded-lg p-3">
            <InlineMessage
              className="mb-2"
              message="ヒートマップの取得に失敗しました。"
              variant="error"
            />
            <Button onPress={onRetryPixels}>再取得</Button>
          </View>
        ) : null}
        {/* 取得成功時のみヒートマップを描画 */}
        {pixelQuery.isLoading || pixelQuery.error ? null : (
          <CompactHeatmap
            graphColor={graph.color}
            pixels={pixelQuery.data ?? []}
            weeks={COMPACT_HEATMAP_WEEKS}
          />
        )}
      </View>
      {/* 主操作: Quick Addを控えめにしつつカード内で完結させる */}
      <ActionStack className="mt-3">
        <Button
          isDisabled={isActionDisabled}
          onPress={() => {
            onPressAddPixel(graph);
          }}
          size="sm"
          variant="secondary"
        >
          記録する
        </Button>
        <Button
          isDisabled={isActionDisabled}
          onPress={() => {
            onPressOpenPixels(graph);
          }}
          size="sm"
          variant="ghost"
        >
          記録一覧
        </Button>
      </ActionStack>
    </SectionCard>
  );
};
