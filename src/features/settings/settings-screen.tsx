import { useRouter } from "expo-router";
import { Button, Input } from "heroui-native";
import { useMemo, useState } from "react";
import { Text } from "react-native";
import { deleteUser, updateUserToken } from "../../shared/api/user";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import { showAlert } from "../../shared/platform/app-alert";
import {
  canOpenExternalUrl,
  openExternalUrl,
} from "../../shared/platform/app-linking";
import { ActionStack } from "../../shared/ui/action-stack";
import { FormField } from "../../shared/ui/form-field";
import { InlineMessage } from "../../shared/ui/inline-message";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";

/**
 * ユーザー設定と外部リンクを表示するSettings画面。
 */
export const SettingsScreen = () => {
  const router = useRouter();
  const { clearAuthSession, credentials, setAuthSession } = useAuthSession();
  const [tokenOverride, setTokenOverride] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const username = credentials?.username ?? null;
  const currentToken = tokenOverride ?? credentials?.token ?? null;
  const profileUrl = useMemo(() => {
    if (!username) {
      return "https://pixe.la";
    }
    return `https://pixe.la/@${username}`;
  }, [username]);

  /**
   * 外部リンクを開く。開けない場合はエラーダイアログを表示する。
   */
  const onOpenExternalLink = async (url: string) => {
    const canOpen = await canOpenExternalUrl(url);
    if (!canOpen) {
      showAlert("エラー", "リンクを開けませんでした。");
      return;
    }
    await openExternalUrl(url);
  };

  /**
   * 認証情報を削除して認証画面へ戻す。
   */
  const onLogout = async () => {
    await clearAuthSession();
    router.replace("/auth");
  };

  /**
   * ログアウト確認ダイアログを表示する。
   */
  const onPressLogout = () => {
    showAlert("ログアウト", "ログアウトしますか？", [
      {
        style: "cancel",
        text: "キャンセル",
      },
      {
        onPress: async () => {
          await onLogout();
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
      await setAuthSession({
        token: normalizedToken,
        username,
      });
      setTokenOverride(normalizedToken);
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

    showAlert(
      "ユーザー削除",
      "この操作は取り消せません。ユーザーを削除しますか？",
      [
        {
          style: "cancel",
          text: "キャンセル",
        },
        {
          onPress: async () => {
            await onConfirmDeleteUser(username, currentToken);
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
      await clearAuthSession();
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
    <ScreenContainer scrollable>
      {/* 画面ヘッダー: Settings概要 */}
      <Text className="mb-2 font-bold text-2xl text-neutral-900">Settings</Text>
      <Text className="mb-6 text-neutral-600">
        アカウントとアプリ情報を管理します。
      </Text>

      {/* ユーザーセクション: トークン更新とプロフィール導線 */}
      <SectionCard className="mb-6" title="ユーザー">
        <FormField label="新しいトークン">
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            className="text-base"
            onChangeText={setNewToken}
            placeholder="new-token"
            secureTextEntry
            value={newToken}
            variant="secondary"
          />
        </FormField>
        <ActionStack>
          <Button
            isDisabled={isSubmitting}
            onPress={onPressUpdateToken}
            testID="settings-update-token-button"
          >
            トークン変更
          </Button>
          <Button
            onPress={() => {
              onOpenExternalLink(profileUrl);
            }}
          >
            プロフィールを開く
          </Button>
        </ActionStack>
      </SectionCard>

      {/* アプリセクション: アプリ関連リンク（現時点は準備中） */}
      <SectionCard className="mb-6" title="アプリ">
        <ActionStack>
          <Button isDisabled>プライバシーポリシー（準備中）</Button>
          <Button isDisabled>利用規約（準備中）</Button>
        </ActionStack>
      </SectionCard>

      {/* Pixelaセクション: 外部サイト/規約リンク */}
      <SectionCard className="mb-6" title="Pixela">
        <ActionStack>
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
        </ActionStack>
      </SectionCard>

      {/* 危険操作セクション: アカウント削除とログアウト */}
      <SectionCard title="危険操作" tone="danger">
        <ActionStack>
          <Button
            isDisabled={isSubmitting}
            onPress={onPressDeleteUser}
            testID="settings-delete-user-button"
          >
            ユーザー削除
          </Button>
          <Button
            isDisabled={isSubmitting}
            onPress={onPressLogout}
            testID="settings-logout-button"
          >
            ログアウト
          </Button>
        </ActionStack>
      </SectionCard>

      {/* API成功メッセージ */}
      {message ? (
        <InlineMessage className="mt-4" message={message} variant="success" />
      ) : null}
      {/* API失敗メッセージ */}
      {errorMessage ? (
        <InlineMessage
          className="mt-4"
          message={errorMessage}
          variant="error"
        />
      ) : null}
    </ScreenContainer>
  );
};
