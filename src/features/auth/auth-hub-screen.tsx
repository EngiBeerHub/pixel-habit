import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { Text, View } from "react-native";

/**
 * 認証関連の入口を選択するハブ画面。
 */
export const AuthHubScreen = () => {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center bg-white px-6">
      {/* 画面ヘッダー: 認証フローの入口説明 */}
      <Text className="mb-2 font-bold text-3xl text-neutral-900">
        Pixel Habit
      </Text>
      <Text className="mb-8 text-neutral-600">
        ログインまたはアカウント作成を選択してください。
      </Text>

      {/* 認証導線: ログイン / アカウント作成 */}
      <View className="gap-3">
        <Button
          onPress={() => {
            router.push("/auth/sign-in");
          }}
          testID="auth-hub-sign-in-button"
        >
          ログイン
        </Button>
        <Button
          onPress={() => {
            router.push("/auth/sign-up");
          }}
        >
          アカウント作成
        </Button>
      </View>
    </View>
  );
};
