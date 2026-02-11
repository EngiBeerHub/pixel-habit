import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import {
  clearAuthCredentials,
  loadAuthCredentials,
} from "../../shared/storage/auth-storage";

/**
 * ユーザー設定と外部リンクを表示するSettings画面。
 */
export const SettingsScreen = () => {
  const router = useRouter();
  const [profileUrl, setProfileUrl] = useState<string>("https://pixe.la");

  useEffect(() => {
    let isMounted = true;

    const hydrateProfileUrl = async () => {
      const credentials = await loadAuthCredentials();
      if (!isMounted) {
        return;
      }

      if (credentials) {
        setProfileUrl(`https://pixe.la/@${credentials.username}`);
      }
    };

    hydrateProfileUrl();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * 外部リンクを開く。開けない場合はエラーダイアログを表示する。
   */
  const onOpenExternalLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("エラー", "リンクを開けませんでした。");
      return;
    }
    await Linking.openURL(url);
  };

  /**
   * 認証情報を削除して認証画面へ戻す。
   */
  const onLogout = async () => {
    await clearAuthCredentials();
    router.replace("/auth");
  };

  /**
   * ログアウト確認ダイアログを表示する。
   */
  const onPressLogout = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      {
        style: "cancel",
        text: "キャンセル",
      },
      {
        onPress: () => {
          onLogout();
        },
        style: "destructive",
        text: "ログアウト",
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16 pb-6">
      <Text className="mb-2 font-bold text-2xl text-neutral-900">Settings</Text>
      <Text className="mb-6 text-neutral-600">
        アカウントとアプリ情報を管理します。
      </Text>

      <View className="mb-6 rounded-xl border border-neutral-200 p-4">
        <Text className="mb-3 font-semibold text-lg text-neutral-900">
          ユーザー
        </Text>
        <View className="gap-3">
          <Button
            onPress={() => {
              onOpenExternalLink(profileUrl);
            }}
          >
            プロフィールを開く
          </Button>
          <Button
            onPress={() => {
              onOpenExternalLink("https://pixe.la");
            }}
          >
            Pixelaサイト
          </Button>
        </View>
      </View>

      <View className="mb-6 rounded-xl border border-neutral-200 p-4">
        <Text className="mb-3 font-semibold text-lg text-neutral-900">
          アプリ
        </Text>
        <View className="gap-3">
          <Button isDisabled>プライバシーポリシー（準備中）</Button>
          <Button isDisabled>利用規約（準備中）</Button>
        </View>
      </View>

      <View className="mb-6 rounded-xl border border-neutral-200 p-4">
        <Text className="mb-3 font-semibold text-lg text-neutral-900">
          Pixela
        </Text>
        <View className="gap-3">
          <Button
            onPress={() => {
              onOpenExternalLink("https://pixe.la");
            }}
          >
            ウェブサイト
          </Button>
          <Button
            onPress={() => {
              onOpenExternalLink("https://pixe.la/terms");
            }}
          >
            利用規約
          </Button>
          <Button
            onPress={() => {
              onOpenExternalLink("https://pixe.la/privacy");
            }}
          >
            プライバシーポリシー
          </Button>
        </View>
      </View>

      <View className="rounded-xl border border-red-200 bg-red-50 p-4">
        <Text className="mb-3 font-semibold text-lg text-red-700">
          危険操作
        </Text>
        <Button onPress={onPressLogout}>ログアウト</Button>
      </View>
    </ScrollView>
  );
};
