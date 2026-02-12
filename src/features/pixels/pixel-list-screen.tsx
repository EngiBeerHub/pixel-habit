import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import type { Pixel } from "../../shared/api/pixel";
import { useAuthSession } from "../../shared/auth/use-auth-session";

/**
 * 指定グラフのピクセル一覧を表示する画面。
 */
export const PixelListScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    graphId?: string;
    graphName?: string;
  }>();
  const graphId = typeof params.graphId === "string" ? params.graphId : "";
  const graphName =
    typeof params.graphName === "string" ? params.graphName : "";
  const { credentials, hasLoadError, status } = useAuthSession();
  const api = useAuthedPixelaApi();

  const query = useQuery({
    enabled: Boolean(api.isAuthenticated && graphId) && status !== "loading",
    queryFn: () => {
      if (!graphId) {
        return [];
      }
      return api.getPixels({
        graphId,
      });
    },
    queryKey: ["pixels", graphId],
  });

  const errorMessage = useMemo(() => {
    if (hasLoadError) {
      return "認証情報の読み込みに失敗しました。";
    }
    if (status === "anonymous" && !credentials) {
      return "認証情報が見つかりません。再ログインしてください。";
    }
    if (!query.error) {
      return null;
    }
    if (query.error instanceof Error) {
      return query.error.message;
    }
    return "ピクセル一覧の取得に失敗しました。";
  }, [credentials, hasLoadError, query.error, status]);

  /**
   * ピクセル編集画面へ遷移する。
   */
  const onPressEditPixel = (pixel: Pixel) => {
    router.push({
      params: {
        date: pixel.date,
        graphId,
        graphName,
        quantity: pixel.quantity,
      },
      pathname: "/graphs/[graphId]/pixels/[date]",
    });
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-6">
      {/* 画面ヘッダー: 対象グラフ情報 */}
      <Text className="font-bold text-2xl text-neutral-900">
        {graphName || "ピクセル一覧"}
      </Text>
      <Text className="mt-2 mb-4 text-neutral-600">
        グラフID: {graphId || "-"}
      </Text>

      {/* 主要導線: 記録追加画面 */}
      <View className="mb-4">
        <Button
          onPress={() => {
            router.push({
              params: {
                graphId,
                graphName,
              },
              pathname: "/graphs/[graphId]/add",
            });
          }}
        >
          記録を追加
        </Button>
      </View>
      {/* 補助導線: Homeへ戻る */}
      <View className="mb-4">
        <Button
          onPress={() => {
            router.push("/(tabs)/home");
          }}
        >
          Homeへ戻る
        </Button>
      </View>

      {/* 一覧取得中のローディング */}
      {query.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-neutral-600">読み込み中...</Text>
        </View>
      ) : null}

      {/* 一覧取得失敗時のエラー表示 */}
      {!query.isLoading && errorMessage ? (
        <View className="rounded-xl border border-red-200 bg-red-50 p-4">
          <Text className="mb-3 text-red-700">{errorMessage}</Text>
          <Button
            onPress={() => {
              query.refetch();
            }}
          >
            再試行
          </Button>
        </View>
      ) : null}

      {/* 正常取得かつ0件時の空状態 */}
      {!(query.isLoading || errorMessage) && query.data?.length === 0 ? (
        <View className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <Text className="text-neutral-700">
            まだ記録がありません。上のボタンから追加してください。
          </Text>
        </View>
      ) : null}

      {/* 正常取得時の一覧。各行から編集/削除画面へ遷移 */}
      {!(query.isLoading || errorMessage) &&
      query.data &&
      query.data.length > 0 ? (
        <FlatList<Pixel>
          className="mt-2"
          data={query.data}
          keyExtractor={(item) => item.date}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                query.refetch();
              }}
              refreshing={query.isFetching}
            />
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl border border-neutral-200 p-4">
              <Text className="font-semibold text-lg text-neutral-900">
                {item.date}
              </Text>
              <Text className="mt-1 text-neutral-600">
                数量: {item.quantity || "(withBody=falseのため未取得)"}
              </Text>
              <View className="mt-3">
                <Button
                  onPress={() => {
                    onPressEditPixel(item);
                  }}
                >
                  編集/削除
                </Button>
              </View>
            </View>
          )}
        />
      ) : null}
    </View>
  );
};
