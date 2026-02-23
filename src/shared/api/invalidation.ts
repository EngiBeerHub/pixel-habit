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
      queryKey: queryKeys.graphsAll(),
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
 * グラフ一覧queryを即時再取得する。
 */
export const refetchGraphListQueries = async (queryClient: QueryClient) => {
  await queryClient.refetchQueries({
    queryKey: queryKeys.graphsAll(),
    type: "active",
  });
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
