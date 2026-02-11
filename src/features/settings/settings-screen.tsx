import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { deleteUser, updateUserToken } from "../../shared/api/user";
import {
  clearAuthCredentials,
  loadAuthCredentials,
  saveAuthCredentials,
} from "../../shared/storage/auth-storage";

/**
 * ユーザー設定と外部リンクを表示するSettings画面。
 */
export const SettingsScreen = () => {
  const router = useRouter();
  const [profileUrl, setProfileUrl] = useState<string>("https://pixe.la");
  const [username, setUsername] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrateProfile = async () => {
      const credentials = await loadAuthCredentials();
      if (!isMounted) {
        return;
      }

      if (credentials) {
        setProfileUrl(`https://pixe.la/@${credentials.username}`);
        setUsername(credentials.username);
        setCurrentToken(credentials.token);
      }
    };

    hydrateProfile();

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

  /**
   * トークン更新APIを実行し、成功時はローカル保存済みトークンを同期する。
   */
  const onPressUpdateToken = async () => {
    if (!(username && currentToken)) {
      setErrorMessage("認証情報が見つかりません。再ログインしてください。");
      return;
    }

    const normalizedToken = newToken.trim();
    if (normalizedToken.length < 8) {
      setErrorMessage("新しいトークンは8文字以上で入力してください。");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setMessage(null);
      const response = await updateUserToken({
        newToken: normalizedToken,
        token: currentToken,
        username,
      });
      await saveAuthCredentials({
        token: normalizedToken,
        username,
      });
      setCurrentToken(normalizedToken);
      setNewToken("");
      setMessage(response.message);
    } catch (error) {
      const messageText =
        error instanceof Error
          ? error.message
          : "トークン更新に失敗しました。再度お試しください。";
      setErrorMessage(messageText);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * ユーザー削除確認ダイアログを表示する。
   */
  const onPressDeleteUser = () => {
    if (!(username && currentToken)) {
      setErrorMessage("認証情報が見つかりません。再ログインしてください。");
      return;
    }

    Alert.alert(
      "ユーザー削除",
      "この操作は取り消せません。ユーザーを削除しますか？",
      [
        {
          style: "cancel",
          text: "キャンセル",
        },
        {
          onPress: () => {
            onConfirmDeleteUser(username, currentToken);
          },
          style: "destructive",
          text: "削除する",
        },
      ]
    );
  };

  /**
   * ユーザー削除APIを実行し、成功時は認証画面へ遷移する。
   */
  const onConfirmDeleteUser = async (
    currentUsername: string,
    token: string
  ) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setMessage(null);
      await deleteUser({
        token,
        username: currentUsername,
      });
      await clearAuthCredentials();
      router.replace("/auth");
    } catch (error) {
      const messageText =
        error instanceof Error
          ? error.message
          : "ユーザー削除に失敗しました。再度お試しください。";
      setErrorMessage(messageText);
    } finally {
      setIsSubmitting(false);
    }
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
        <View className="mb-3">
          <Text className="mb-2 text-neutral-800">新しいトークン</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded-xl border border-neutral-300 px-4 py-3 text-base"
            onChangeText={setNewToken}
            placeholder="new-token"
            secureTextEntry
            value={newToken}
          />
        </View>
        <View className="gap-3">
          <Button isDisabled={isSubmitting} onPress={onPressUpdateToken}>
            トークン変更
          </Button>
          <Button
            onPress={() => {
              onOpenExternalLink(profileUrl);
            }}
          >
            プロフィールを開く
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
        <View className="gap-3">
          <Button isDisabled={isSubmitting} onPress={onPressDeleteUser}>
            ユーザー削除
          </Button>
          <Button isDisabled={isSubmitting} onPress={onPressLogout}>
            ログアウト
          </Button>
        </View>
      </View>

      {message ? (
        <Text className="mt-4 text-green-700 text-sm">{message}</Text>
      ) : null}
      {errorMessage ? (
        <Text className="mt-4 text-red-600 text-sm">{errorMessage}</Text>
      ) : null}
    </ScrollView>
  );
};
