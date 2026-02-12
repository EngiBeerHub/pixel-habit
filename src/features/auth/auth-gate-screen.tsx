import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { loadAuthCredentials } from "../../shared/storage/auth-storage";

/**
 * 保存済み認証情報の有無で初期遷移先を決定するゲート画面。
 */
export const AuthGateScreen = () => {
  const router = useRouter();
  const authQuery = useQuery({
    queryFn: loadAuthCredentials,
    queryKey: ["authCredentials"],
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    if (authQuery.isError) {
      router.replace("/auth");
      return;
    }
    if (authQuery.isSuccess) {
      if (authQuery.data) {
        router.replace("/(tabs)/home");
        return;
      }
      router.replace("/auth");
    }
  }, [authQuery.data, authQuery.isError, authQuery.isSuccess, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {/* 起動時の認証判定中インジケーター */}
      <ActivityIndicator />
      <Text className="mt-3 text-neutral-600">起動準備中...</Text>
    </View>
  );
};
