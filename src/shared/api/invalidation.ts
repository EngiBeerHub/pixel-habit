import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/**
 * グラフ関連表示を再同期するためのinvalidate群。
 */
export const invalidateGraphRelatedQueries = async (
  queryClient: QueryClient,
  username: string | null
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.graphs(username),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.graphDetailPixelsAll(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.graphPixelsCompactAll(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.graphPixelsToday(username),
    }),
  ]);
};

/**
 * Homeのカード表示で使うcompactヒートマップを再取得する。
 */
export const refetchCompactHeatmapQueries = async (
  queryClient: QueryClient,
  username: string | null
) => {
  await queryClient.refetchQueries({
    queryKey: queryKeys.graphPixelsCompactByUser(username),
    type: "active",
  });
};

/**
 * 記録更新/削除後に関連クエリを再取得し、各画面表示を同期する。
 */
export const invalidatePixelRelatedQueries = async (
  queryClient: QueryClient,
  username: string | null
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.graphDetailPixelsAll(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.graphPixelsCompactAll(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.graphPixelsToday(username),
    }),
  ]);
};
