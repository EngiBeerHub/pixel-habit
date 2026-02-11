import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
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
import {
  type AuthCredentials,
  loadAuthCredentials,
} from "../../shared/storage/auth-storage";

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
  const [credentials, setCredentials] = useState<AuthCredentials | null>(null);
  const [authLoadError, setAuthLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<GraphViewMode>("compact");

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
        `総記録数: ${stats.totalPixelsCount ?? "-"}`,
        `合計: ${stats.totalQuantity ?? "-"}`,
        `平均: ${stats.avgQuantity ?? "-"}`,
        `今日: ${stats.todaysQuantity ?? "-"}`,
        `昨日: ${stats.yesterdayQuantity ?? "-"}`,
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
   * 記録追加画面へ遷移する。
   */
  const onPressAddPixel = (graph: GraphDefinition) => {
    router.push({
      params: {
        graphId: graph.id,
        graphName: graph.name,
      },
      pathname: "/graphs/[graphId]/add",
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

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-6">
      <View className="mb-4 gap-3">
        <Text className="font-bold text-2xl text-neutral-900">グラフ一覧</Text>
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
            </View>
          )}
        />
      ) : null}
    </View>
  );
};

/**
 * PixelaグラフページのURLを生成する。
 */
const buildPixelaGraphUrl = (username: string, graphId: string): string => {
  return `https://pixe.la/v1/users/${username}/graphs/${graphId}.html`;
};
