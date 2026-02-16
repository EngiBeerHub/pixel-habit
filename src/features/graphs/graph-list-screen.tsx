import { useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  NotificationFeedbackType,
  notificationAsync as notifyHaptics,
} from "expo-haptics";
import { useRouter } from "expo-router";
import {
  BottomSheet,
  Button,
  Input,
  SkeletonGroup,
  TextArea,
  useToast,
} from "heroui-native";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  type Control,
  Controller,
  type FieldErrors,
  useForm,
} from "react-hook-form";
import {
  FlatList,
  Keyboard,
  type NativeSyntheticEvent,
  RefreshControl,
  type TargetedEvent,
  Text,
  View,
} from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import type { GraphDefinition } from "../../shared/api/graph";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import {
  borderTokens,
  surfaceTokens,
  textTokens,
} from "../../shared/config/ui-tokens";
import { mergeClassNames } from "../../shared/lib/class-name";
import {
  getTodayAsYyyyMmDd,
  normalizeYyyyMmDdInput,
} from "../../shared/lib/date";
import { SectionCard } from "../../shared/ui/section-card";
import {
  type PixelAddFormValues,
  pixelAddSchema,
} from "../pixels/pixel-add-schema";
import { GraphCard } from "./components/graph-card";

/**
 * Quick Addシート内の入力フォーム。
 * HeroUI Input/TextAreaをBottom Sheet内で安定動作させるため、キーボード状態を同期する。
 */
interface QuickAddSheetFormProps {
  control: Control<PixelAddFormValues>;
  isSubmitting: boolean;
  onSubmit: () => void;
  pixelFormErrors: FieldErrors<PixelAddFormValues>;
  selectedGraph: GraphDefinition | null;
}

const HOME_LOADING_SKELETON_KEYS = ["card-a", "card-b"] as const;

const QuickAddSheetForm = ({
  control,
  isSubmitting,
  onSubmit,
  pixelFormErrors,
  selectedGraph,
}: QuickAddSheetFormProps) => {
  const { animatedKeyboardState } = useBottomSheetInternal();

  /**
   * フォーカス中の入力をBottom Sheetへ通知し、キーボード追従を安定させる。
   */
  const onFocusInput = (event: NativeSyntheticEvent<TargetedEvent>) => {
    animatedKeyboardState.set((state) => ({
      ...state,
      target: event.nativeEvent.target,
    }));
  };

  /**
   * 対象入力のフォーカス解除時にキーボードターゲットをクリアする。
   */
  const onBlurInput = (event: NativeSyntheticEvent<TargetedEvent>) => {
    const keyboardState = animatedKeyboardState.get();
    if (keyboardState.target === event.nativeEvent.target) {
      animatedKeyboardState.set((state) => ({
        ...state,
        target: undefined,
      }));
    }
  };

  return (
    <>
      {/* シート見出し: 対象グラフ名を文脈として表示 */}
      <BottomSheet.Title className="font-semibold text-lg text-neutral-900">
        {selectedGraph ? `${selectedGraph.name} に記録追加` : "記録追加"}
      </BottomSheet.Title>

      {/* 日付入力: yyyyMMdd形式。入力時に正規化してフォーム値へ反映 */}
      <Text className="mt-2 text-neutral-800">日付 (yyyyMMdd) *</Text>
      <Controller
        control={control}
        name="date"
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            onBlur={(event) => {
              onBlurInput(event);
              onBlur();
            }}
            onChangeText={(text) => {
              onChange(normalizeYyyyMmDdInput(text));
            }}
            onFocus={onFocusInput}
            placeholder="20260211"
            testID="graph-quick-add-date-input"
            value={value}
            variant="secondary"
          />
        )}
      />
      {/* 日付バリデーションエラー */}
      {pixelFormErrors.date?.message ? (
        <Text className="text-red-600 text-sm">
          {pixelFormErrors.date.message}
        </Text>
      ) : null}

      {/* 数量入力 */}
      <Text className="mt-1 text-neutral-800">
        数量{selectedGraph?.unit ? ` (${selectedGraph.unit})` : ""} *
      </Text>
      <Controller
        control={control}
        name="quantity"
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            onBlur={(event) => {
              onBlurInput(event);
              onBlur();
            }}
            onChangeText={onChange}
            onFocus={onFocusInput}
            placeholder="10"
            testID="graph-quick-add-quantity-input"
            value={value}
            variant="secondary"
          />
        )}
      />
      {/* 数量バリデーションエラー */}
      {pixelFormErrors.quantity?.message ? (
        <Text className="text-red-600 text-sm">
          {pixelFormErrors.quantity.message}
        </Text>
      ) : null}

      {/* 任意メモ入力 */}
      <Text className="mt-1 text-neutral-800">メモ</Text>
      <Controller
        control={control}
        name="optionalData"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextArea
            onBlur={(event) => {
              onBlurInput(event);
              onBlur();
            }}
            onChangeText={onChange}
            onFocus={onFocusInput}
            placeholder="補足メモ"
            testID="graph-quick-add-optional-data-input"
            value={value}
            variant="secondary"
          />
        )}
      />
      {/* API失敗時のフォーム共通エラー */}
      {pixelFormErrors.root?.message ? (
        <Text className="text-red-600 text-sm">
          {pixelFormErrors.root.message}
        </Text>
      ) : null}
      {/* シート内アクション: 直接保存 */}
      <View className="mt-2">
        <Button
          isDisabled={isSubmitting}
          onPress={onSubmit}
          size="sm"
          testID="graph-quick-add-save-button"
          variant="primary"
        >
          保存
        </Button>
      </View>
    </>
  );
};

/**
 * 認証情報を使って Pixela のグラフ一覧を表示する画面。
 */
export const GraphListScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState<GraphDefinition | null>(
    null
  );
  const { toast } = useToast();
  const snapPoints = useMemo(() => ["70%"], []);
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
      router.replace("/auth");
    }
  }, [credentials, router, status]);

  const query = useQuery({
    enabled: api.isAuthenticated && status !== "loading",
    queryFn: api.getGraphs,
    queryKey: ["graphs", api.username],
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
      await query.refetch();
      if (api.username) {
        await queryClient.invalidateQueries({
          queryKey: ["graphPixelsCompact", api.username],
        });
      }
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
      if (api.username) {
        await queryClient.refetchQueries({
          queryKey: ["graphPixelsCompact", api.username],
          type: "active",
        });
      }
    } finally {
      setIsPullRefreshing(false);
    }
  };

  /**
   * 記録追加のBottom Sheetを開く。
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
  };

  /**
   * Bottom Sheet内の記録追加を実行する。
   */
  const onSubmitQuickAdd = handleSubmit((values) => {
    addPixelMutation.mutate(values);
  });

  const hasGraphs = Boolean(query.data && query.data.length > 0);
  const shouldShowSkeleton = isGraphListLoading;
  const shouldShowError = !isGraphListLoading && Boolean(errorMessage);
  const canRenderDataState = !(isGraphListLoading || errorMessage);
  const shouldShowEmpty = canRenderDataState && !hasGraphs;
  const shouldShowGraphList = canRenderDataState && hasGraphs;
  let listEmptyComponent: ReactNode = null;
  if (shouldShowSkeleton) {
    listEmptyComponent = (
      <View className="gap-3" testID="graph-list-loading-skeleton">
        {HOME_LOADING_SKELETON_KEYS.map((key) => (
          <SectionCard key={key}>
            <SkeletonGroup className="gap-3" isSkeletonOnly>
              <SkeletonGroup.Item className="h-7 w-36 rounded-full" />
              <SkeletonGroup.Item className="h-48 w-full rounded-xl" />
            </SkeletonGroup>
          </SectionCard>
        ))}
      </View>
    );
  } else if (shouldShowError) {
    listEmptyComponent = (
      <SectionCard
        className={mergeClassNames("border", borderTokens.dangerClass)}
        tone="danger"
      >
        <View className="gap-3">
          <Text className={textTokens.dangerClass}>{errorMessage}</Text>
          <Button onPress={onRetry} testID="graph-list-retry-button">
            再試行
          </Button>
        </View>
      </SectionCard>
    );
  } else if (shouldShowEmpty) {
    listEmptyComponent = (
      <SectionCard className="bg-neutral-50">
        <Text className="text-neutral-700">
          グラフがまだ登録されていません。
        </Text>
      </SectionCard>
    );
  }

  return (
    <>
      <FlatList<GraphDefinition>
        automaticallyAdjustContentInsets
        className={mergeClassNames("flex-1", surfaceTokens.screenClass)}
        contentContainerClassName="px-6 pb-6 pt-2"
        contentInsetAdjustmentBehavior="automatic"
        data={shouldShowGraphList ? (query.data ?? []) : []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={listEmptyComponent}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={isPullRefreshing} />
        }
        renderItem={({ item }) =>
          api.isAuthenticated ? (
            <GraphCard
              graph={item}
              isActionDisabled={addPixelMutation.isPending}
              onPressAddForDate={onPressAddForDate}
              onPressAddToday={onPressAddToday}
              onPressOpenDetail={onPressOpenDetail}
            />
          ) : null
        }
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
      {/* クイック記録追加用Bottom Sheet */}
      <BottomSheet
        isOpen={isQuickAddOpen}
        onOpenChange={(isOpen) => {
          setIsQuickAddOpen(isOpen);
          if (!isOpen) {
            Keyboard.dismiss();
            setSelectedGraph(null);
          }
        }}
      >
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            contentContainerClassName="gap-2 px-6 pt-2 pb-4"
            enablePanDownToClose
            snapPoints={snapPoints}
          >
            <QuickAddSheetForm
              control={control}
              isSubmitting={addPixelMutation.isPending}
              onSubmit={onSubmitQuickAdd}
              pixelFormErrors={pixelFormErrors}
              selectedGraph={selectedGraph}
            />
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </>
  );
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
