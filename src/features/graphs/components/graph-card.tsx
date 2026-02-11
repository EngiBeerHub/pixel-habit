import { useQuery } from "@tanstack/react-query";
import { Button } from "heroui-native";
import { Text, View } from "react-native";
import type { GraphDefinition } from "../../../shared/api/graph";
import { getPixels } from "../../../shared/api/pixel";
import { getGraphThemeColor } from "../../../shared/lib/graph-theme";
import type { AuthCredentials } from "../../../shared/storage/auth-storage";
import { CompactHeatmap, getCompactHeatmapDateRange } from "./compact-heatmap";

const COMPACT_HEATMAP_WEEKS = 14;

/**
 * グラフカード描画に必要な入力値。
 */
export interface GraphCardProps {
  credentials: AuthCredentials;
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
  credentials,
  graph,
  isActionDisabled,
  onPressAddPixel,
  onPressGraphMenu,
  onPressOpenFullView,
  onPressOpenPixels,
  viewMode,
}: GraphCardProps) => {
  const compactHeatmapRange = getCompactHeatmapDateRange(COMPACT_HEATMAP_WEEKS);

  const pixelQuery = useQuery({
    enabled: viewMode === "compact",
    queryFn: () => {
      return getPixels({
        from: compactHeatmapRange.from,
        graphId: graph.id,
        token: credentials.token,
        to: compactHeatmapRange.to,
        username: credentials.username,
      });
    },
    queryKey: [
      "graphPixelsCompact",
      credentials.username,
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
    <View className="mb-3 rounded-xl border border-neutral-200 p-4">
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
      <Text className="mt-1 text-neutral-600">ID: {graph.id}</Text>
      <Text className="text-neutral-600">
        単位: {graph.unit} / タイムゾーン: {graph.timezone}
      </Text>
      {viewMode === "compact" ? (
        <View>
          {pixelQuery.isLoading ? (
            <View className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <Text className="text-neutral-600 text-sm">
                記録を読み込み中...
              </Text>
            </View>
          ) : null}
          {!pixelQuery.isLoading && pixelQuery.error ? (
            <View className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <Text className="mb-2 text-red-700 text-sm">
                ヒートマップの取得に失敗しました。
              </Text>
              <Button onPress={onRetryPixels}>再取得</Button>
            </View>
          ) : null}
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
      <View className="mt-3">
        <Button
          isDisabled={isActionDisabled}
          onPress={() => {
            onPressAddPixel(graph);
          }}
        >
          記録する
        </Button>
      </View>
      <View className="mt-2">
        <Button
          isDisabled={isActionDisabled}
          onPress={() => {
            onPressOpenPixels(graph);
          }}
        >
          記録一覧
        </Button>
      </View>
    </View>
  );
};
