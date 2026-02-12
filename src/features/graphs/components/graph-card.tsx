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
  onPressOpenFullView: (graphId: string) => void;
  onPressOpenPixels: (graph: GraphDefinition) => void;
  viewMode: "compact" | "full";
}

/**
 * グラフ1件分のカードを描画し、Compact時はカード単位でヒートマップを取得する。
 */
export const GraphCard = ({
  graph,
  isActionDisabled,
  onPressAddPixel,
  onPressGraphMenu,
  onPressOpenFullView,
  onPressOpenPixels,
  viewMode,
}: GraphCardProps) => {
  const api = useAuthedPixelaApi();
  const compactHeatmapRange = getCompactHeatmapDateRange(COMPACT_HEATMAP_WEEKS);

  const pixelQuery = useQuery({
    enabled: viewMode === "compact" && api.isAuthenticated,
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
      {viewMode === "compact" ? (
        <View>
          {/* Compact表示: カード内ヒートマップ取得中のプレースホルダー */}
          {pixelQuery.isLoading ? (
            <InlineMessage
              className="mt-3"
              message="記録を読み込み中..."
              variant="info"
            />
          ) : null}
          {/* Compact表示: カード単位エラー。再取得だけを局所的に実行する */}
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
          {/* Compact表示: 取得成功時のみヒートマップを描画 */}
          {pixelQuery.isLoading || pixelQuery.error ? null : (
            <CompactHeatmap
              graphColor={graph.color}
              pixels={pixelQuery.data ?? []}
              weeks={COMPACT_HEATMAP_WEEKS}
            />
          )}
        </View>
      ) : null}
      {viewMode === "full" ? (
        /* Full表示: MVP中はPixelaのWebページへ遷移する導線を表示 */
        <View className="mt-3 rounded-lg bg-neutral-50 p-3">
          <Text className="mb-2 text-neutral-700 text-sm">
            Fullビューは現在Pixelaページを開く方式です。
          </Text>
          <Button
            onPress={() => {
              onPressOpenFullView(graph.id);
            }}
          >
            Fullビューを開く
          </Button>
        </View>
      ) : null}
      {/* 主操作: クイック記録追加 */}
      <ActionStack className="mt-3">
        <Button
          isDisabled={isActionDisabled}
          onPress={() => {
            onPressAddPixel(graph);
          }}
        >
          記録する
        </Button>
        <Button
          isDisabled={isActionDisabled}
          onPress={() => {
            onPressOpenPixels(graph);
          }}
        >
          記録一覧
        </Button>
      </ActionStack>
    </SectionCard>
  );
};
