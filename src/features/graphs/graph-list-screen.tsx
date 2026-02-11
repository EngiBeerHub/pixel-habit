import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
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
import {
  type AuthCredentials,
  loadAuthCredentials,
} from "../../shared/storage/auth-storage";
import {
  type PixelAddFormValues,
  pixelAddSchema,
} from "../pixels/pixel-add-schema";

/**
 * Home画面で利用する表示モード。
 */
type GraphViewMode = "compact" | "full";

/**
 * Pixelaの色名をUIで使う色コードへ変換するマップ。
 */
const graphThemeColorMap: Record<GraphDefinition["color"], string> = {
  ajisai: "#7c3aed",
  ichou: "#ca8a04",
  kuro: "#171717",
  momiji: "#dc2626",
  shibafu: "#16a34a",
  sora: "#0284c7",
};

/**
 * 認証情報を使って Pixela のグラフ一覧を表示する画面。
 */
export const GraphListScreen = () => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [credentials, setCredentials] = useState<AuthCredentials | null>(null);
  const [authLoadError, setAuthLoadError] = useState<string | null>(null);
  const [sheetMessage, setSheetMessage] = useState<string | null>(null);
  const [selectedGraph, setSelectedGraph] = useState<GraphDefinition | null>(
    null
  );
  const [viewMode, setViewMode] = useState<GraphViewMode>("compact");
  const snapPoints = useMemo(() => ["50%"], []);
  const {
    control,
    formState: { errors: pixelFormErrors },
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
    let isMounted = true;

    const hydrate = async () => {
      try {
        const stored = await loadAuthCredentials();
        if (!isMounted) {
          return;
        }
        setCredentials(stored);
        if (!stored) {
          setAuthLoadError("接続情報がありません。接続設定画面へ移動します。");
          router.replace("/auth");
        }
      } catch {
        if (isMounted) {
          setAuthLoadError("接続情報の読み込みに失敗しました。");
        }
      }
    };

    hydrate();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const query = useQuery({
    enabled: Boolean(credentials),
    queryFn: () => {
      if (!credentials) {
        return [];
      }
      return getGraphs(credentials);
    },
    queryKey: ["graphs", credentials?.username],
  });

  const errorMessage = useMemo(() => {
    if (authLoadError) {
      return authLoadError;
    }
    if (!query.error) {
      return null;
    }
    if (query.error instanceof Error) {
      return query.error.message;
    }
    return "グラフ一覧の取得に失敗しました。";
  }, [authLoadError, query.error]);

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
      Alert.alert("統計取得エラー", message);
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
      Alert.alert(`${graph.name} の統計`, lines.join("\n"));
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
      Alert.alert("削除エラー", message);
    },
    onSuccess: async (response) => {
      Alert.alert("削除完了", response.message);
      await query.refetch();
    },
  });

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
  const onRefresh = () => {
    query.refetch();
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
    Alert.alert(
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
    Alert.alert(graph.name, "操作を選択してください。", [
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
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("エラー", "グラフURLを開けませんでした。");
      return;
    }
    await Linking.openURL(url);
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
    router.push({
      params: {
        graphId: selectedGraph.id,
        graphName: selectedGraph.name,
      },
      pathname: "/graphs/[graphId]/add",
    });
    bottomSheetRef.current?.close();
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-6">
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
          >
            Compact
          </Button>
          <Button
            isDisabled={viewMode === "full"}
            onPress={() => {
              setViewMode("full");
            }}
          >
            Full
          </Button>
        </View>
      </View>

      {query.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-neutral-600">読み込み中...</Text>
        </View>
      ) : null}

      {!query.isLoading && errorMessage ? (
        <View className="rounded-xl border border-red-200 bg-red-50 p-4">
          <Text className="mb-3 text-red-700">{errorMessage}</Text>
          <Button onPress={onRetry}>再試行</Button>
        </View>
      ) : null}

      {!(query.isLoading || errorMessage) && query.data?.length === 0 ? (
        <View className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <Text className="text-neutral-700">
            グラフがまだ登録されていません。
          </Text>
        </View>
      ) : null}

      {!(query.isLoading || errorMessage) &&
      query.data &&
      query.data.length > 0 ? (
        <FlatList<GraphDefinition>
          className="mt-2"
          data={query.data}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={query.isFetching}
            />
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl border border-neutral-200 p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <View className="mb-2 flex-row items-center gap-2">
                    <View
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: graphThemeColorMap[item.color],
                      }}
                    />
                    <Text className="font-semibold text-lg text-neutral-900">
                      {item.name}
                    </Text>
                  </View>
                </View>
                <Button
                  isDisabled={
                    statsMutation.isPending || deleteMutation.isPending
                  }
                  onPress={() => {
                    onPressGraphMenu(item);
                  }}
                >
                  ...
                </Button>
              </View>
              <Text className="mt-1 text-neutral-600">ID: {item.id}</Text>
              <Text className="text-neutral-600">
                単位: {item.unit} / タイムゾーン: {item.timezone}
              </Text>
              {viewMode === "full" ? (
                <View className="mt-3 rounded-lg bg-neutral-50 p-3">
                  <Text className="mb-2 text-neutral-700 text-sm">
                    Fullビューは現在Pixelaページを開く方式です。
                  </Text>
                  <Button
                    onPress={() => {
                      onPressOpenFullView(item.id);
                    }}
                  >
                    Fullビューを開く
                  </Button>
                </View>
              ) : null}
              <View className="mt-3">
                <Button
                  isDisabled={
                    statsMutation.isPending || deleteMutation.isPending
                  }
                  onPress={() => {
                    onPressAddPixel(item);
                  }}
                >
                  記録する
                </Button>
              </View>
              <View className="mt-2">
                <Button
                  isDisabled={
                    statsMutation.isPending || deleteMutation.isPending
                  }
                  onPress={() => {
                    onPressOpenPixels(item);
                  }}
                >
                  記録一覧
                </Button>
              </View>
            </View>
          )}
        />
      ) : null}

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
          <Text className="font-semibold text-lg text-neutral-900">
            {selectedGraph ? `${selectedGraph.name} に記録追加` : "記録追加"}
          </Text>
          <Text className="text-neutral-600">
            日付と数量を入力して保存してください。
          </Text>

          <Text className="mt-2 text-neutral-800">日付 (yyyyMMdd)</Text>
          <Controller
            control={control}
            name="date"
            render={({ field: { onBlur, onChange, value } }) => (
              <BottomSheetTextInput
                className="rounded-xl border border-neutral-300 px-4 py-3 text-base"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="20260211"
                value={value}
              />
            )}
          />
          {pixelFormErrors.date?.message ? (
            <Text className="text-red-600 text-sm">
              {pixelFormErrors.date.message}
            </Text>
          ) : null}

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
          {pixelFormErrors.quantity?.message ? (
            <Text className="text-red-600 text-sm">
              {pixelFormErrors.quantity.message}
            </Text>
          ) : null}
          {pixelFormErrors.root?.message ? (
            <Text className="text-red-600 text-sm">
              {pixelFormErrors.root.message}
            </Text>
          ) : null}
          {sheetMessage ? (
            <Text className="text-green-700 text-sm">{sheetMessage}</Text>
          ) : null}

          <View className="mt-2 gap-2">
            <Button
              isDisabled={addPixelMutation.isPending}
              onPress={onSubmitQuickAdd}
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

/**
 * 端末の現在日付を Pixela 指定の `yyyyMMdd` 形式へ変換する。
 */
const getTodayAsYyyyMmDd = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};
