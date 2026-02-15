import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button, useToast } from "heroui-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import type { GraphDefinition } from "../../shared/api/graph";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import {
  borderTokens,
  spacingTokens,
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
import { getCompactHeatmapDateRange } from "./components/compact-heatmap";
import { GraphCard } from "./components/graph-card";

/**
 * 認証情報を使って Pixela のグラフ一覧を表示する画面。
 */
export const GraphListScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedGraph, setSelectedGraph] = useState<GraphDefinition | null>(
    null
  );
  const todayYyyyMmDd = getTodayAsYyyyMmDd();
  const compactHeatmapRange = getCompactHeatmapDateRange(14);
  const { toast } = useToast();
  const snapPoints = useMemo(() => ["50%"], []);
  const {
    control,
    formState: { errors: pixelFormErrors },
    getValues,
    handleSubmit,
    reset,
    setError,
  } = useForm<PixelAddFormValues>({
    defaultValues: {
      date: getTodayAsYyyyMmDd(),
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

  const todayRecordQueries = useQueries({
    queries:
      query.data?.map((graph) => ({
        enabled: api.isAuthenticated,
        queryFn: () =>
          api.getPixels({
            from: todayYyyyMmDd,
            graphId: graph.id,
            to: todayYyyyMmDd,
          }),
        queryKey: ["graphPixelsToday", api.username, graph.id, todayYyyyMmDd],
      })) ?? [],
  });

  const todayMissingGraphs = useMemo(() => {
    return resolveTodayMissingGraphs({
      graphs: query.data,
      todayRecordQueries,
      todayYyyyMmDd,
    });
  }, [query.data, todayRecordQueries, todayYyyyMmDd]);

  const topMissingGraph = todayMissingGraphs[0] ?? null;
  const remainingMissingCount =
    todayMissingGraphs.length > 0 ? todayMissingGraphs.length - 1 : 0;

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
      bottomSheetRef.current?.close();
      toast.show({
        description: response.message,
        label: "記録を追加しました",
        variant: "success",
      });
    },
  });

  /**
   * Bottom Sheet のバックドロップを描画する。
   */
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

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
    await query.refetch();
    if (api.username) {
      await queryClient.refetchQueries({
        queryKey: ["graphPixelsCompact", api.username],
        type: "active",
      });
    }
  };

  /**
   * 記録追加のBottom Sheetを開く。
   */
  const openQuickAdd = (graph: GraphDefinition, date?: string) => {
    setSelectedGraph(graph);
    reset({
      date: date ?? getTodayAsYyyyMmDd(),
      quantity: "",
    });
    bottomSheetRef.current?.snapToIndex(0);
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

  /**
   * 選択中グラフの詳細入力画面へ遷移する。
   */
  const onPressDetailedInput = () => {
    if (!selectedGraph) {
      return;
    }
    const values = {
      date: normalizeYyyyMmDdInput(getValues("date")),
      quantity: getValues("quantity"),
    };
    router.push({
      params: {
        date: values.date,
        graphId: selectedGraph.id,
        graphName: selectedGraph.name,
        quantity: values.quantity,
      },
      pathname: "/graphs/[graphId]/add",
    });
    bottomSheetRef.current?.close();
  };

  /**
   * 一覧の先頭に表示するHome補助情報（期間、成功トースト、Today）。
   */
  const renderListHeader = () => {
    return (
      <View
        className={mergeClassNames(spacingTokens.listHeaderGapClass, "pb-3")}
      >
        <Text className={`text-sm ${textTokens.mutedClass}`}>
          {formatPeriodLabel(compactHeatmapRange.from, compactHeatmapRange.to)}
        </Text>
        {/* Todayエリア: 未入力グラフは上位1件のみ表示し、一覧と同じスクロール文脈で扱う */}
        {topMissingGraph ? (
          <SectionCard
            className={mergeClassNames(
              "border",
              borderTokens.warningClass,
              surfaceTokens.warningSubtleClass
            )}
          >
            <View testID="today-focus-card">
              <Text
                className={mergeClassNames(
                  "font-medium text-xs",
                  textTokens.warningClass
                )}
              >
                Today 未入力
              </Text>
              <Text
                className={mergeClassNames(
                  "mt-1 text-sm",
                  textTokens.warningEmphasisClass
                )}
              >
                {topMissingGraph.name} が未入力です
              </Text>
              {remainingMissingCount > 0 ? (
                <Text
                  className={mergeClassNames(
                    "mt-1 text-xs",
                    textTokens.warningSubtleClass
                  )}
                  testID="today-focus-remaining"
                >
                  他{remainingMissingCount}件未入力
                </Text>
              ) : null}
              <View className="mt-2">
                <Button
                  onPress={() => {
                    onPressAddToday(topMissingGraph);
                  }}
                  size="sm"
                  testID="today-quick-add-button"
                  variant="primary"
                >
                  今日を入力
                </Button>
              </View>
            </View>
          </SectionCard>
        ) : null}
      </View>
    );
  };

  return (
    <View
      className={mergeClassNames(
        "flex-1 px-6 pt-4 pb-6",
        surfaceTokens.screenClass
      )}
    >
      {/* 初回ロード時の全画面ローディング */}
      {query.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className={mergeClassNames("mt-3", textTokens.secondaryClass)}>
            読み込み中...
          </Text>
        </View>
      ) : null}

      {/* 一覧取得失敗時の全画面エラー。再試行で一覧を再取得 */}
      {!query.isLoading && errorMessage ? (
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
      ) : null}
      {/* 正常取得かつ0件時の空状態 */}
      {!(query.isLoading || errorMessage) && query.data?.length === 0 ? (
        <SectionCard className="bg-neutral-50">
          <Text className="text-neutral-700">
            グラフがまだ登録されていません。
          </Text>
        </SectionCard>
      ) : null}

      {/* 正常取得時のグラフ一覧。カードごとの状態管理はGraphCardへ委譲 */}
      {!(query.isLoading || errorMessage) &&
      query.data &&
      query.data.length > 0 ? (
        <FlatList<GraphDefinition>
          className="mt-1"
          contentContainerClassName="px-1 pb-2"
          data={query.data}
          disableVirtualization
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={query.isFetching}
            />
          }
          removeClippedSubviews={false}
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
        />
      ) : null}

      {/* クイック記録追加用Bottom Sheet */}
      <BottomSheet
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        index={-1}
        onChange={(index) => {
          if (index === -1) {
            setSelectedGraph(null);
          }
        }}
        ref={bottomSheetRef}
        snapPoints={snapPoints}
      >
        <BottomSheetView className="flex-1 gap-3 px-6 pt-4">
          {/* シート見出し: 対象グラフ名を文脈として表示 */}
          <Text className="font-semibold text-lg text-neutral-900">
            {selectedGraph ? `${selectedGraph.name} に記録追加` : "記録追加"}
          </Text>
          <Text className="text-neutral-500 text-sm">
            日付と数量を入力して保存してください。
          </Text>

          {/* 日付入力: yyyyMMdd形式。入力時に正規化してフォーム値へ反映 */}
          <Text className="mt-2 text-neutral-800">日付 (yyyyMMdd)</Text>
          <Controller
            control={control}
            name="date"
            render={({ field: { onBlur, onChange, value } }) => (
              <BottomSheetTextInput
                className="rounded-xl border border-neutral-300 px-4 py-3 text-base"
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(normalizeYyyyMmDdInput(text));
                }}
                placeholder="20260211"
                value={value}
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
          <Text className="mt-1 text-neutral-800">数量</Text>
          <Controller
            control={control}
            name="quantity"
            render={({ field: { onBlur, onChange, value } }) => (
              <BottomSheetTextInput
                className="rounded-xl border border-neutral-300 px-4 py-3 text-base"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="10"
                value={value}
              />
            )}
          />
          {/* 数量バリデーションエラー */}
          {pixelFormErrors.quantity?.message ? (
            <Text className="text-red-600 text-sm">
              {pixelFormErrors.quantity.message}
            </Text>
          ) : null}
          {/* API失敗時のフォーム共通エラー */}
          {pixelFormErrors.root?.message ? (
            <Text className="text-red-600 text-sm">
              {pixelFormErrors.root.message}
            </Text>
          ) : null}
          {/* シート内アクション: 直接保存 or 詳細入力画面へ遷移 */}
          <View className="mt-2 gap-2">
            <Button
              isDisabled={addPixelMutation.isPending}
              onPress={onSubmitQuickAdd}
              size="sm"
              testID="graph-quick-add-save-button"
              variant="primary"
            >
              保存
            </Button>
            <Button onPress={onPressDetailedInput} size="sm" variant="tertiary">
              詳細入力へ
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

/**
 * 当日ピクセルが1件でも存在し、かつ数量が1以上なら「入力済み」と判定する。
 */
const hasTodayRecord = (
  pixels: Array<{ date: string; quantity: string }>,
  todayYyyyMmDd: string
): boolean => {
  return pixels.some((pixel) => {
    if (pixel.date !== todayYyyyMmDd) {
      return false;
    }
    const quantity = Number(pixel.quantity);
    return Number.isFinite(quantity) && quantity >= 1;
  });
};

/**
 * 14週範囲の `from/to` を Homeヘッダー用の月表示へ整形する。
 */
const formatPeriodLabel = (from: string, to: string): string => {
  const fromYear = from.slice(0, 4);
  const fromMonth = String(Number(from.slice(4, 6)));
  const toYear = to.slice(0, 4);
  const toMonth = String(Number(to.slice(4, 6)));

  if (fromYear === toYear) {
    return `${fromYear}年${fromMonth}月 - ${toMonth}月`;
  }
  return `${fromYear}年${fromMonth}月 - ${toYear}年${toMonth}月`;
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

/**
 * Todayエリア用に、当日未入力のグラフ一覧を算出する。
 */
const resolveTodayMissingGraphs = ({
  graphs,
  todayRecordQueries,
  todayYyyyMmDd,
}: {
  graphs: GraphDefinition[] | undefined;
  todayRecordQueries: Array<{
    data?: Array<{ date: string; quantity: string }>;
  }>;
  todayYyyyMmDd: string;
}): GraphDefinition[] => {
  if (!graphs || graphs.length === 0) {
    return [];
  }

  return graphs.filter((_graph, index) => {
    const todayPixels = todayRecordQueries[index]?.data ?? [];
    return !hasTodayRecord(todayPixels, todayYyyyMmDd);
  });
};
