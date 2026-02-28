import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  NotificationFeedbackType,
  notificationAsync as notifyHaptics,
} from "expo-haptics";
import { useRouter } from "expo-router";
import { useToast } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { type Control, type FieldErrors, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import { useAuthedPixelaApi } from "../../../shared/api/authed-pixela-api";
import type { GraphDefinition } from "../../../shared/api/graph";
import {
  invalidateGraphRelatedQueries,
  refetchCompactHeatmapQueries,
} from "../../../shared/api/invalidation";
import { queryKeys } from "../../../shared/api/query-keys";
import { useAuthSession } from "../../../shared/auth/use-auth-session";
import { appRoutes } from "../../../shared/config/routes";
import { getTodayAsYyyyMmDd } from "../../../shared/lib/date";
import { createNavigationPressGuard } from "../../../shared/navigation/navigation-press-guard";
import {
  type PixelAddFormValues,
  pixelAddSchema,
} from "../../pixels/pixel-add-schema";

/**
 * GraphList画面から使う状態/副作用をまとめた戻り値。
 */
export interface UseGraphListScreenResult {
  addPixelMutation: {
    isPending: boolean;
    mutate: (values: PixelAddFormValues) => void;
  };
  api: ReturnType<typeof useAuthedPixelaApi>;
  control: Control<PixelAddFormValues>;
  errorMessage: string | null;
  isGraphListLoading: boolean;
  isPullRefreshing: boolean;
  isQuickAddOpen: boolean;
  onPressAddForDate: (graph: GraphDefinition, date: string) => void;
  onPressAddToday: (graph: GraphDefinition) => void;
  onPressOpenDetail: (graph: GraphDefinition) => void;
  onQuickAddOpenChange: (isOpen: boolean) => void;
  onRefresh: () => Promise<void>;
  onRetry: () => void;
  onSubmitQuickAdd: () => void;
  pixelFormErrors: FieldErrors<PixelAddFormValues>;
  query: ReturnType<typeof useQuery<GraphDefinition[]>>;
  selectedGraph: GraphDefinition | null;
}

/**
 * HomeのGraphList画面で必要な状態と操作を提供する。
 */
export const useGraphListScreen = (): UseGraphListScreenResult => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const guardNavigationPress = useMemo(createNavigationPressGuard, []);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState<GraphDefinition | null>(
    null
  );
  const { toast } = useToast();

  const {
    control,
    formState: { errors: pixelFormErrors },
    handleSubmit,
    reset,
    setError,
  } = useForm<PixelAddFormValues>({
    defaultValues: {
      date: getTodayAsYyyyMmDd(),
      optionalData: "",
      quantity: "",
    },
    resolver: zodResolver(pixelAddSchema),
  });

  const { credentials, hasLoadError, status } = useAuthSession();
  const api = useAuthedPixelaApi();

  useEffect(() => {
    if (status === "anonymous" && !credentials) {
      router.replace(appRoutes.authHub);
    }
  }, [credentials, router, status]);

  const query = useQuery({
    enabled: api.isAuthenticated && status !== "loading",
    queryFn: api.getGraphs,
    queryKey: queryKeys.graphs(api.username),
  });
  const isGraphListLoading = status === "loading" || query.isPending;

  const errorMessage = useMemo(() => {
    return resolveGraphListErrorMessage({
      credentials,
      hasLoadError,
      queryError: query.error,
      status,
    });
  }, [credentials, hasLoadError, query.error, status]);

  const addPixelMutation = useMutation({
    mutationFn: (values: PixelAddFormValues) => {
      if (!selectedGraph) {
        throw new Error("対象グラフが未選択です。");
      }
      return api.addPixel({
        date: values.date,
        graphId: selectedGraph.id,
        optionalData: values.optionalData,
        quantity: values.quantity,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "記録追加に失敗しました。再度お試しください。";
      setError("root", { message });
    },
    onSuccess: async (response) => {
      await invalidateGraphRelatedQueries(queryClient, api.username);
      Keyboard.dismiss();
      setIsQuickAddOpen(false);
      try {
        await notifyHaptics(NotificationFeedbackType.Success);
      } catch {
        // 触覚非対応端末では無視する
      }
      toast.show({
        description: response.message,
        label: "記録を追加しました",
        variant: "success",
      });
    },
  });

  /**
   * グラフ一覧を再取得する。
   */
  const onRetry = () => {
    query.refetch();
  };

  /**
   * pull-to-refreshでグラフ一覧を再取得する。
   */
  const onRefresh = async () => {
    setIsPullRefreshing(true);
    try {
      await query.refetch();
      await refetchCompactHeatmapQueries(queryClient, api.username);
    } finally {
      setIsPullRefreshing(false);
    }
  };

  /**
   * 記録追加Bottom Sheetを開く。
   */
  const openQuickAdd = (graph: GraphDefinition, date?: string) => {
    setSelectedGraph(graph);
    reset({
      date: date ?? getTodayAsYyyyMmDd(),
      optionalData: "",
      quantity: "",
    });
    setIsQuickAddOpen(true);
  };

  const onPressAddToday = (graph: GraphDefinition) => {
    openQuickAdd(graph, getTodayAsYyyyMmDd());
  };

  const onPressAddForDate = (graph: GraphDefinition, date: string) => {
    openQuickAdd(graph, date);
  };

  /**
   * グラフ詳細画面へ遷移する。
   */
  const onPressOpenDetail = (graph: GraphDefinition) => {
    guardNavigationPress(() => {
      router.push({
        params: {
          color: graph.color,
          graphId: graph.id,
          graphName: graph.name,
          timezone: graph.timezone,
          unit: graph.unit,
        },
        pathname: "/graphs/[graphId]",
      });
    });
  };

  const onSubmitQuickAdd = handleSubmit((values) => {
    addPixelMutation.mutate(values);
  });

  /**
   * Bottom Sheetの開閉に応じてローカル状態を同期する。
   */
  const onQuickAddOpenChange = (isOpen: boolean) => {
    setIsQuickAddOpen(isOpen);
    if (!isOpen) {
      Keyboard.dismiss();
      setSelectedGraph(null);
    }
  };

  return {
    addPixelMutation,
    api,
    control,
    errorMessage,
    isGraphListLoading,
    isPullRefreshing,
    isQuickAddOpen,
    onPressAddForDate,
    onPressAddToday,
    onPressOpenDetail,
    onQuickAddOpenChange,
    onRefresh,
    onRetry,
    onSubmitQuickAdd,
    pixelFormErrors,
    query,
    selectedGraph,
  };
};

/**
 * 一覧取得エラーと認証読み込みエラーをUI表示文言へ変換する。
 */
const resolveGraphListErrorMessage = ({
  credentials,
  hasLoadError,
  queryError,
  status,
}: {
  credentials: { token: string; username: string } | null;
  hasLoadError: boolean;
  queryError: unknown;
  status: "anonymous" | "authenticated" | "loading";
}): string | null => {
  if (hasLoadError) {
    return "接続情報の読み込みに失敗しました。";
  }
  if (status === "anonymous" && !credentials) {
    return "接続情報がありません。接続設定画面へ移動します。";
  }
  if (!queryError) {
    return null;
  }
  if (queryError instanceof Error) {
    return queryError.message;
  }
  return "グラフ一覧の取得に失敗しました。";
};
