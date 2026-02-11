import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { type GraphDefinition, getGraphs } from "../../shared/api/graph";
import {
  type AuthCredentials,
  clearAuthCredentials,
  loadAuthCredentials,
} from "../../shared/storage/auth-storage";

/**
 * 認証情報を使って Pixela のグラフ一覧を表示する画面。
 */
export const GraphListScreen = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState<AuthCredentials | null>(null);
  const [authLoadError, setAuthLoadError] = useState<string | null>(null);

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
          setAuthLoadError(
            "接続情報がありません。先に接続設定を行ってください。"
          );
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
  }, []);

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

  const onResetCredentials = async () => {
    await clearAuthCredentials();
    router.replace("/");
  };

  const onRetry = () => {
    query.refetch();
  };

  const onRefresh = () => {
    query.refetch();
  };

  const onPressReset = () => {
    onResetCredentials();
  };
  const onPressAddPixel = (graph: GraphDefinition) => {
    router.push({
      params: {
        graphId: graph.id,
        graphName: graph.name,
      },
      pathname: "/graphs/[graphId]/add",
    });
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-6">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-bold text-2xl text-neutral-900">グラフ一覧</Text>
        <Button onPress={onPressReset}>接続解除</Button>
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
              <Text className="font-semibold text-lg text-neutral-900">
                {item.name}
              </Text>
              <Text className="mt-1 text-neutral-600">ID: {item.id}</Text>
              <Text className="text-neutral-600">
                単位: {item.unit} / タイムゾーン: {item.timezone}
              </Text>
              <View className="mt-3">
                <Button onPress={() => onPressAddPixel(item)}>記録する</Button>
              </View>
            </View>
          )}
        />
      ) : null}
    </View>
  );
};
