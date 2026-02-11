import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { loadAuthCredentials } from "../../shared/storage/auth-storage";

/**
 * 保存済み認証情報の有無で初期遷移先を決定するゲート画面。
 */
export const AuthGateScreen = () => {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const resolveInitialRoute = async () => {
      const credentials = await loadAuthCredentials();
      if (!isMounted) {
        return;
      }

      if (credentials) {
        router.replace("/(tabs)/home");
        return;
      }

      router.replace("/auth");
    };

    resolveInitialRoute();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ActivityIndicator />
      <Text className="mt-3 text-neutral-600">起動準備中...</Text>
    </View>
  );
};
