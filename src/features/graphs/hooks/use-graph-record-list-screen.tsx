import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useAuthedPixelaApi } from "../../../shared/api/authed-pixela-api";
import type { Pixel } from "../../../shared/api/pixel";
import { queryKeys } from "../../../shared/api/query-keys";
import { useAuthSession } from "../../../shared/auth/use-auth-session";
import { getGraphDetailFullRange } from "../../../shared/lib/calendar-range";
import { deserializeOptionalData } from "../../../shared/lib/optional-data";

export interface UseGraphRecordListScreenResult {
  errorMessage: string | null;
  graphName: string;
  graphUnit: string;
  isMemoOnly: boolean;
  isPending: boolean;
  latestRecordDateLabel: string;
  onChangeMemoFilter: (nextValue: boolean) => void;
  onPressOpenPixelDetail: (pixel: Pixel) => void;
  pixels: Pixel[];
  query: ReturnType<typeof useQuery<Pixel[]>>;
  visibleCountLabel: string;
}

/**
 * Graph 記録一覧画面のデータ取得と表示状態を管理する。
 */
export const useGraphRecordListScreen = (): UseGraphRecordListScreenResult => {
  const router = useRouter();
  const navigation = useNavigation();
  const { credentials, hasLoadError, status } = useAuthSession();
  const api = useAuthedPixelaApi();
  const params = useLocalSearchParams<{
    graphId?: string;
    graphName?: string;
    unit?: string;
  }>();
  const graphId = typeof params.graphId === "string" ? params.graphId : "";
  const graphName =
    typeof params.graphName === "string" ? params.graphName : "記録";
  const graphUnit = typeof params.unit === "string" ? params.unit : "";
  const [isMemoOnly, setIsMemoOnly] = useState(false);
  const activeRange = useMemo(() => getGraphDetailFullRange(), []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLargeTitle: false,
      title: graphName,
    });
  }, [graphName, navigation]);

  const query = useQuery({
    enabled: Boolean(api.isAuthenticated && graphId) && status !== "loading",
    queryFn: () => {
      if (!graphId) {
        return [];
      }
      return api.getPixels({
        from: activeRange.from,
        graphId,
        to: activeRange.to,
      });
    },
    queryKey: queryKeys.graphDetailPixels(api.username, graphId, "full"),
  });

  const errorMessage = useMemo(() => {
    if (hasLoadError) {
      return "認証情報の読み込みに失敗しました。";
    }
    if (status === "anonymous" && !credentials) {
      return "認証情報が見つかりません。再ログインしてください。";
    }
    if (!graphId) {
      return "グラフIDが不正です。Home画面からやり直してください。";
    }
    if (!query.error) {
      return null;
    }
    if (query.error instanceof Error) {
      return query.error.message;
    }
    return "記録一覧の取得に失敗しました。";
  }, [credentials, graphId, hasLoadError, query.error, status]);

  const pixels = useMemo(() => {
    const sortedPixels = [...(query.data ?? [])].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    if (!isMemoOnly) {
      return sortedPixels;
    }

    return sortedPixels.filter((pixel) => {
      return Boolean(deserializeOptionalData(pixel.optionalData));
    });
  }, [isMemoOnly, query.data]);

  const latestRecordDateLabel = useMemo(() => {
    return pixels[0]?.date ?? "—";
  }, [pixels]);

  const onPressOpenPixelDetail = useCallback(
    (pixel: Pixel) => {
      router.push({
        params: {
          date: pixel.date,
          graphId,
          graphName,
          optionalData: pixel.optionalData,
          quantity: pixel.quantity,
        },
        pathname: "/graphs/[graphId]/pixels/[date]",
      });
    },
    [graphId, graphName, router]
  );

  return {
    errorMessage,
    graphName,
    graphUnit,
    isMemoOnly,
    isPending: query.isPending,
    latestRecordDateLabel,
    onChangeMemoFilter: setIsMemoOnly,
    onPressOpenPixelDetail,
    pixels,
    query,
    visibleCountLabel: `${pixels.length}件`,
  };
};
