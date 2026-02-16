import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useMemo, useState } from "react";
import { Text } from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import {
  canOpenExternalUrl,
  openExternalUrl,
} from "../../shared/platform/app-linking";
import { ActionStack } from "../../shared/ui/action-stack";
import { useAppDialog } from "../../shared/ui/app-dialog-provider";
import { InlineMessage } from "../../shared/ui/inline-message";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";

/**
 * ユーザー設定と外部リンクを表示するSettings画面。
 */
export const SettingsScreen = () => {
  const router = useRouter();
  const { open: openDialog } = useAppDialog();
  const { clearAuthSession, credentials } = useAuthSession();
  const api = useAuthedPixelaApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const username = credentials?.username ?? null;
  const profileUrl = useMemo(() => {
    if (!username) {
      return "https://pixe.la";
    }
    return `https://pixe.la/@${username}`;
  }, [username]);

  /**
   * 外部リンクを開く。開けない場合はダイアログを表示する。
   */
  const onOpenExternalLink = async (url: string) => {
    const canOpen = await canOpenExternalUrl(url);
    if (!canOpen) {
      openDialog({
        actions: [{ label: "OK" }],
        description: "リンクを開けませんでした。",
        title: "エラー",
      });
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
    openDialog({
      actions: [
        {
          label: "キャンセル",
          role: "cancel",
        },
        {
          label: "ログアウト",
          onPress: async () => {
            await onLogout();
          },
          role: "destructive",
        },
      ],
      description: "ログアウトしますか？",
      dismissible: false,
      title: "ログアウト",
    });
  };

  /**
   * ユーザー削除確認ダイアログを表示する。
   */
  const onPressDeleteUser = () => {
    if (!username) {
      setErrorMessage("認証情報が見つかりません。再ログインしてください。");
      return;
    }

    openDialog({
      actions: [
        {
          label: "キャンセル",
          role: "cancel",
        },
        {
          label: "削除する",
          onPress: async () => {
            await onConfirmDeleteUser();
          },
          role: "destructive",
        },
      ],
      description: "この操作は取り消せません。ユーザーを削除しますか？",
      dismissible: false,
      title: "ユーザー削除",
    });
  };

  /**
   * ユーザー削除APIを実行し、成功時は認証画面へ遷移する。
   */
  const onConfirmDeleteUser = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await api.deleteUser();
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
    <ScreenContainer scrollable withTopInset={false}>
      <Text className="mb-6 text-neutral-600">
        アカウント管理と外部リンクです。
      </Text>

      <SectionCard className="mb-6" title="アカウント管理">
        <ActionStack>
          <Button
            onPress={() => {
              router.push("/settings/token");
            }}
            testID="settings-open-token-screen-button"
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

      <SectionCard title="危険操作" tone="danger">
        <ActionStack>
          <Button
            isDisabled={isSubmitting}
            onPress={onPressDeleteUser}
            testID="settings-delete-user-button"
            variant="danger-soft"
          >
            ユーザー削除
          </Button>
          <Button
            isDisabled={isSubmitting}
            onPress={onPressLogout}
            testID="settings-logout-button"
            variant="danger-soft"
          >
            ログアウト
          </Button>
        </ActionStack>
      </SectionCard>

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
