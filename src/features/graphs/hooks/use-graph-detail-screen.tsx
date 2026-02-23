import { Ionicons } from "@expo/vector-icons";
import { MenuView, type NativeActionEvent } from "@react-native-menu/menu";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Platform, PlatformColor, View } from "react-native";
import { useAuthedPixelaApi } from "../../../shared/api/authed-pixela-api";
import type { Pixel } from "../../../shared/api/pixel";
import { queryKeys } from "../../../shared/api/query-keys";
import { useAuthSession } from "../../../shared/auth/use-auth-session";
import { appRoutes } from "../../../shared/config/routes";
import {
  headerActionTokens,
  menuIconTokens,
} from "../../../shared/config/ui-tokens";
import {
  type CalendarMode,
  getCalendarMonthRange,
  getCalendarYearRange,
} from "../../../shared/lib/calendar-range";
import { buildGraphDetailSummary } from "../../../shared/lib/graph-detail-summary";
import { useAppDialog } from "../../../shared/ui/app-dialog-provider";

const GRAPH_MENU_ACTION_EDIT = "edit";
const GRAPH_MENU_ACTION_DELETE = "delete";

/**
 * Graph Detail画面ロジックの戻り値。
 */
export interface UseGraphDetailScreenResult {
  activeRange: {
    from: string;
    to: string;
  };
  errorMessage: string | null;
  graphId: string;
  graphTimezone: string;
  graphUnit: string;
  mode: CalendarMode;
  onChangeMode: (mode: CalendarMode) => void;
  onPressOpenPixelDetail: (pixel: Pixel) => void;
  pixels: Pixel[];
  query: ReturnType<typeof useQuery<Pixel[]>>;
  summary: ReturnType<typeof buildGraphDetailSummary>;
}

/**
 * Graph詳細画面の状態管理とヘッダーメニュー設定を提供する。
 */
export const useGraphDetailScreen = (): UseGraphDetailScreenResult => {
  const router = useRouter();
  const navigation = useNavigation();
  const { open: openDialog } = useAppDialog();
  const params = useLocalSearchParams<{
    color?: string;
    graphId?: string;
    graphName?: string;
    timezone?: string;
    unit?: string;
  }>();
  const graphId = typeof params.graphId === "string" ? params.graphId : "";
  const graphName =
    typeof params.graphName === "string" ? params.graphName : "グラフ詳細";
  const graphColor = typeof params.color === "string" ? params.color : "";
  const graphTimezone =
    typeof params.timezone === "string" ? params.timezone : "Asia/Tokyo";
  const graphUnit = typeof params.unit === "string" ? params.unit : "";
  const [mode, setMode] = useState<CalendarMode>("month");
  const { credentials, hasLoadError, status } = useAuthSession();
  const api = useAuthedPixelaApi();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLargeTitle: Platform.OS === "ios",
      title: graphName,
    });
  }, [graphName, navigation]);

  const activeRange = useMemo(() => {
    if (mode === "month") {
      return getCalendarMonthRange();
    }
    return getCalendarYearRange();
  }, [mode]);

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
    queryKey: queryKeys.graphDetailPixels(api.username, graphId, mode),
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
    if (!query.data) {
      return [];
    }
    return [...query.data].sort((a, b) => b.date.localeCompare(a.date));
  }, [query.data]);

  const summary = useMemo(() => {
    return buildGraphDetailSummary(pixels);
  }, [pixels]);

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!graphId) {
        throw new Error("グラフIDが不正です。Home画面からやり直してください。");
      }
      return api.deleteGraph({ graphId });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "グラフ削除に失敗しました。再度お試しください。";
      openDialog({
        actions: [{ label: "OK" }],
        description: message,
        title: "削除エラー",
      });
    },
    onSuccess: (response) => {
      openDialog({
        actions: [
          {
            label: "OK",
            onPress: () => {
              router.replace(appRoutes.homeTab);
            },
          },
        ],
        description: response.message,
        title: "削除完了",
      });
    },
  });

  /**
   * グラフ編集画面へ遷移する。
   */
  const onPressOpenGraphEdit = useCallback(() => {
    router.push({
      params: {
        color: graphColor,
        graphId,
        graphName,
        timezone: graphTimezone,
        unit: graphUnit,
      },
      pathname: "/graphs/[graphId]/edit",
    });
  }, [graphColor, graphId, graphName, graphTimezone, graphUnit, router]);

  /**
   * グラフ削除確認ダイアログを表示する。
   */
  const onPressDeleteGraph = useCallback(() => {
    openDialog({
      actions: [
        {
          label: "キャンセル",
          role: "cancel",
        },
        {
          label: "削除する",
          onPress: () => {
            deleteMutation.mutate();
          },
          role: "destructive",
        },
      ],
      description: `${graphName} を削除しますか？この操作は取り消せません。`,
      dismissible: false,
      title: "グラフ削除",
    });
  }, [deleteMutation, graphName, openDialog]);

  const graphMenuActions = useMemo(
    () => [
      {
        id: GRAPH_MENU_ACTION_EDIT,
        image: Platform.OS === "ios" ? "square.and.pencil" : undefined,
        imageColor: menuIconTokens.primaryColor,
        title: "編集",
      },
      {
        attributes: {
          destructive: true,
        },
        id: GRAPH_MENU_ACTION_DELETE,
        image: Platform.OS === "ios" ? "trash" : undefined,
        imageColor: menuIconTokens.destructiveColor,
        title: "削除",
      },
    ],
    []
  );

  /**
   * ネイティブメニュー選択イベントを処理する。
   */
  const onPressGraphMenuAction = useCallback(
    ({ nativeEvent }: NativeActionEvent) => {
      if (nativeEvent.event === GRAPH_MENU_ACTION_EDIT) {
        onPressOpenGraphEdit();
        return;
      }
      if (nativeEvent.event === GRAPH_MENU_ACTION_DELETE) {
        onPressDeleteGraph();
      }
    },
    [onPressDeleteGraph, onPressOpenGraphEdit]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }: { tintColor?: string }) => (
        <MenuView
          actions={graphMenuActions}
          isAnchoredToRight
          onPressAction={onPressGraphMenuAction}
          testID="graph-detail-header-menu-button"
        >
          <View className={headerActionTokens.iconButtonClass}>
            <Ionicons
              color={
                Platform.OS === "ios"
                  ? PlatformColor("label")
                  : (tintColor ?? undefined)
              }
              name="ellipsis-horizontal"
              size={headerActionTokens.iconSize}
            />
          </View>
        </MenuView>
      ),
    });
  }, [graphMenuActions, navigation, onPressGraphMenuAction]);

  /**
   * 選択した日付の記録詳細画面へ遷移する。
   */
  const onPressOpenPixelDetail = (pixel: Pixel) => {
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
  };

  return {
    activeRange,
    errorMessage,
    graphId,
    graphTimezone,
    graphUnit,
    mode,
    onChangeMode: setMode,
    onPressOpenPixelDetail,
    pixels,
    query,
    summary,
  };
};
