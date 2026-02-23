import { Button, Input } from "heroui-native";
import { useState } from "react";
import { Text } from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import { ActionStack } from "../../shared/ui/action-stack";
import { FormField } from "../../shared/ui/form-field";
import { InlineMessage } from "../../shared/ui/inline-message";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";

/**
 * トークン更新専用画面。
 */
export const TokenUpdateScreen = () => {
  const { credentials, setAuthSession } = useAuthSession();
  const api = useAuthedPixelaApi();
  const [newToken, setNewToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const username = credentials?.username ?? null;

  /**
   * トークン更新APIを実行し、成功時はローカル認証情報へ反映する。
   */
  const onPressUpdateToken = async () => {
    if (!username) {
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
      const response = await api.updateUserToken({
        newToken: normalizedToken,
      });
      await setAuthSession({
        token: normalizedToken,
        username,
      });
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

  return (
    <ScreenContainer contentClassName="gap-4" scrollable withTopInset={false}>
      <SectionCard title="トークン変更">
        <Text className="mb-4 text-neutral-600 text-sm">
          新しいトークンを保存すると、以後のAPI通信に即時適用されます。
        </Text>
        <FormField label="新しいトークン *">
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
        <ActionStack className="mt-2">
          <Button
            isDisabled={isSubmitting}
            onPress={onPressUpdateToken}
            testID="settings-update-token-button"
          >
            トークン変更
          </Button>
        </ActionStack>
      </SectionCard>

      {message ? (
        <InlineMessage className="mt-4" message={message} variant="success" />
      ) : null}
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
