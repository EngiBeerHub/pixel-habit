import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import {
  deleteGraph,
  type GraphDefinition,
  getGraphStats,
  getGraphs,
} from "../../shared/api/graph";
import { addPixel } from "../../shared/api/pixel";
import { useAuthCredentialsQuery } from "../../shared/auth/use-auth-credentials-query";
import {
  getTodayAsYyyyMmDd,
  normalizeYyyyMmDdInput,
} from "../../shared/lib/date";
import { showAlert } from "../../shared/platform/app-alert";
import {
  canOpenExternalUrl,
  openExternalUrl,
} from "../../shared/platform/app-linking";
import {
  type PixelAddFormValues,
  pixelAddSchema,
} from "../pixels/pixel-add-schema";
import { GraphCard } from "./components/graph-card";

/**
 * Home画面で利用する表示モード。
 */
type GraphViewMode = "compact" | "full";

/**
 * 認証情報を使って Pixela のグラフ一覧を表示する画面。
 */
export const GraphListScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sheetMessage, setSheetMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedGraph, setSelectedGraph] = useState<GraphDefinition | null>(
    null
  );
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [viewMode, setViewMode] = useState<GraphViewMode>("compact");
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

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const authQuery = useAuthCredentialsQuery();

  const credentials = authQuery.data ?? null;

  useEffect(() => {
    if (authQuery.isSuccess && !authQuery.data) {
      router.replace("/auth");
    }
  }, [authQuery.data, authQuery.isSuccess, router]);

  const query = useQuery({
    enabled: Boolean(credentials) && !authQuery.isPending,
    queryFn: () => {
      if (!credentials) {
        return [];
      }
      return getGraphs(credentials);
    },
    queryKey: ["graphs", credentials?.username],
  });

  const errorMessage = useMemo(() => {
    if (authQuery.isError) {
      return "接続情報の読み込みに失敗しました。";
    }
    if (authQuery.isSuccess && !authQuery.data) {
      return "接続情報がありません。接続設定画面へ移動します。";
    }
    if (!query.error) {
      return null;
    }
    if (query.error instanceof Error) {
      return query.error.message;
    }
    return "グラフ一覧の取得に失敗しました。";
  }, [authQuery.data, authQuery.isError, authQuery.isSuccess, query.error]);

  const statsMutation = useMutation({
    mutationFn: (graph: GraphDefinition) => {
      if (!credentials) {
        throw new Error("認証情報が見つかりません。再ログインしてください。");
      }
      return getGraphStats({
        graphId: graph.id,
        username: credentials.username,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "統計の取得に失敗しました。再度お試しください。";
      showAlert("統計取得エラー", message);
    },
    onSuccess: (stats, graph) => {
      const lines = [
        "[統計]",
        `総記録数: ${stats.totalPixelsCount ?? "-"}`,
        `合計: ${stats.totalQuantity ?? "-"}`,
        `平均: ${stats.avgQuantity ?? "-"}`,
        `今日: ${stats.todaysQuantity ?? "-"}`,
        `昨日: ${stats.yesterdayQuantity ?? "-"}`,
        `最大値: ${stats.maxQuantity ?? "-"} (${stats.maxDate ?? "-"})`,
        `最小値: ${stats.minQuantity ?? "-"} (${stats.minDate ?? "-"})`,
        "",
        "[グラフ定義]",
        `ID: ${graph.id}`,
        `名前: ${graph.name}`,
        `単位: ${graph.unit}`,
        `種類: ${graph.type}`,
        `色: ${graph.color}`,
        `タイムゾーン: ${graph.timezone}`,
      ];
      showAlert(`${graph.name} の統計`, lines.join("\n"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (graph: GraphDefinition) => {
      if (!credentials) {
        throw new Error("認証情報が見つかりません。再ログインしてください。");
      }
      return deleteGraph({
        graphId: graph.id,
        token: credentials.token,
        username: credentials.username,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "グラフ削除に失敗しました。再度お試しください。";
      showAlert("削除エラー", message);
    },
    onSuccess: async (response) => {
      showAlert("削除完了", response.message);
      await query.refetch();
      if (credentials) {
        await queryClient.invalidateQueries({
          queryKey: ["graphPixelsCompact", credentials.username],
        });
      }
    },
  });

  /**
   * 一定時間だけ表示する成功トーストを表示する。
   */
  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2500);
  };

  const addPixelMutation = useMutation({
    mutationFn: (values: PixelAddFormValues) => {
      if (!credentials) {
        throw new Error("認証情報が見つかりません。再ログインしてください。");
      }
      if (!selectedGraph) {
        throw new Error("対象グラフが未選択です。");
      }
      return addPixel({
        date: values.date,
        graphId: selectedGraph.id,
        quantity: values.quantity,
        token: credentials.token,
        username: credentials.username,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "記録追加に失敗しました。再度お試しください。";
      setError("root", { message });
      setSheetMessage(null);
    },
    onSuccess: async (response) => {
      setSheetMessage(response.message);
      await query.refetch();
      if (credentials) {
        await queryClient.invalidateQueries({
          queryKey: ["graphPixelsCompact", credentials.username],
        });
      }
      bottomSheetRef.current?.close();
      showToast(response.message);
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
    if (credentials) {
      await queryClient.refetchQueries({
        queryKey: ["graphPixelsCompact", credentials.username],
        type: "active",
      });
    }
  };

  /**
   * 記録追加のBottom Sheetを開く。
   */
  const onPressAddPixel = (graph: GraphDefinition) => {
    setSelectedGraph(graph);
    setSheetMessage(null);
    reset({
      date: getTodayAsYyyyMmDd(),
      quantity: "",
    });
    bottomSheetRef.current?.snapToIndex(0);
  };

  /**
   * グラフ作成画面へ遷移する。
   */
  const onPressCreateGraph = () => {
    router.push("/graphs/create");
  };

  /**
   * ピクセル一覧画面へ遷移する。
   */
  const onPressOpenPixels = (graph: GraphDefinition) => {
    router.push({
      params: {
        graphId: graph.id,
        graphName: graph.name,
      },
      pathname: "/graphs/[graphId]/pixels",
    });
  };

  /**
   * グラフ編集画面へ遷移する。
   */
  const onPressEditGraph = (graph: GraphDefinition) => {
    router.push({
      params: {
        color: graph.color,
        graphId: graph.id,
        graphName: graph.name,
        timezone: graph.timezone,
        unit: graph.unit,
      },
      pathname: "/graphs/[graphId]/edit",
    });
  };

  /**
   * グラフ統計を取得してダイアログ表示する。
   */
  const onPressShowStats = (graph: GraphDefinition) => {
    statsMutation.mutate(graph);
  };

  /**
   * グラフ削除確認ダイアログを表示する。
   */
  const onPressDeleteGraph = (graph: GraphDefinition) => {
    showAlert(
      "グラフ削除",
      `${graph.name} を削除しますか？この操作は取り消せません。`,
      [
        {
          style: "cancel",
          text: "キャンセル",
        },
        {
          onPress: () => {
            deleteMutation.mutate(graph);
          },
          style: "destructive",
          text: "削除する",
        },
      ]
    );
  };

  /**
   * グラフカードの追加操作メニューを表示する。
   */
  const onPressGraphMenu = (graph: GraphDefinition) => {
    showAlert(graph.name, "操作を選択してください。", [
      {
        onPress: () => {
          onPressEditGraph(graph);
        },
        text: "編集",
      },
      {
        onPress: () => {
          onPressShowStats(graph);
        },
        text: "統計",
      },
      {
        onPress: () => {
          onPressDeleteGraph(graph);
        },
        style: "destructive",
        text: "削除",
      },
      {
        style: "cancel",
        text: "キャンセル",
      },
    ]);
  };

  /**
   * Full表示用のPixelaグラフURLを開く。
   */
  const onPressOpenFullView = async (graphId: string) => {
    if (!credentials) {
      return;
    }
    const url = buildPixelaGraphUrl(credentials.username, graphId);
    const canOpen = await canOpenExternalUrl(url);
    if (!canOpen) {
      showAlert("エラー", "グラフURLを開けませんでした。");
      return;
    }
    await openExternalUrl(url);
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

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-6">
      {/* 画面ヘッダー: タイトル、グラフ追加、表示モード切替 */}
      <View className="mb-4 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-2xl text-neutral-900">
            グラフ一覧
          </Text>
          <Button onPress={onPressCreateGraph}>グラフ追加</Button>
        </View>
        <View className="flex-row gap-2">
          <Button
            isDisabled={viewMode === "compact"}
            onPress={() => {
              setViewMode("compact");
            }}
            testID="graph-view-mode-compact-button"
          >
            Compact
          </Button>
          <Button
            isDisabled={viewMode === "full"}
            onPress={() => {
              setViewMode("full");
            }}
            testID="graph-view-mode-full-button"
          >
            Full
          </Button>
        </View>
      </View>

      {/* 初回ロード時の全画面ローディング */}
      {query.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-neutral-600">読み込み中...</Text>
        </View>
      ) : null}

      {/* 一覧取得失敗時の全画面エラー。再試行で一覧を再取得 */}
      {!query.isLoading && errorMessage ? (
        <View className="rounded-xl border border-red-200 bg-red-50 p-4">
          <Text className="mb-3 text-red-700">{errorMessage}</Text>
          <Button onPress={onRetry} testID="graph-list-retry-button">
            再試行
          </Button>
        </View>
      ) : null}
      {/* 記録追加成功後に一定時間表示するトースト */}
      {toastMessage ? (
        <View className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <Text className="text-green-700 text-sm">{toastMessage}</Text>
        </View>
      ) : null}

      {/* 正常取得かつ0件時の空状態 */}
      {!(query.isLoading || errorMessage) && query.data?.length === 0 ? (
        <View className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <Text className="text-neutral-700">
            グラフがまだ登録されていません。
          </Text>
        </View>
      ) : null}

      {/* 正常取得時のグラフ一覧。カードごとの状態管理はGraphCardへ委譲 */}
      {!(query.isLoading || errorMessage) &&
      query.data &&
      query.data.length > 0 ? (
        <FlatList<GraphDefinition>
          className="mt-2"
          contentContainerClassName="px-1 pb-2"
          data={query.data}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={query.isFetching}
            />
          }
          removeClippedSubviews={false}
          renderItem={({ item }) =>
            credentials ? (
              <GraphCard
                credentials={credentials}
                graph={item}
                isActionDisabled={
                  statsMutation.isPending || deleteMutation.isPending
                }
                onPressAddPixel={onPressAddPixel}
                onPressGraphMenu={onPressGraphMenu}
                onPressOpenFullView={onPressOpenFullView}
                onPressOpenPixels={onPressOpenPixels}
                viewMode={viewMode}
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
            setSheetMessage(null);
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
          <Text className="text-neutral-600">
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
          {/* API成功時のメッセージ */}
          {sheetMessage ? (
            <Text className="text-green-700 text-sm">{sheetMessage}</Text>
          ) : null}

          {/* シート内アクション: 直接保存 or 詳細入力画面へ遷移 */}
          <View className="mt-2 gap-2">
            <Button
              isDisabled={addPixelMutation.isPending}
              onPress={onSubmitQuickAdd}
              testID="graph-quick-add-save-button"
            >
              保存
            </Button>
            <Button onPress={onPressDetailedInput}>詳細入力へ</Button>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

/**
 * PixelaグラフページのURLを生成する。
 */
const buildPixelaGraphUrl = (username: string, graphId: string): string => {
  return `https://pixe.la/v1/users/${username}/graphs/${graphId}.html`;
};
