import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import { appRoutes } from "../../shared/config/routes";

/**
 * 保存済み認証情報の有無で初期遷移先を決定するゲート画面。
 */
export const AuthGateScreen = () => {
  const router = useRouter();
  const { credentials, status } = useAuthSession();

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (credentials) {
      router.replace(appRoutes.homeTab);
      return;
    }
    router.replace(appRoutes.authHub);
  }, [credentials, router, status]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {/* 起動時の認証判定中インジケーター */}
      <ActivityIndicator />
      <Text className="mt-3 text-neutral-600">起動準備中...</Text>
    </View>
  );
};
