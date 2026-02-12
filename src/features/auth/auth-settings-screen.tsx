import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Button, Input } from "heroui-native";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text } from "react-native";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import { ActionStack } from "../../shared/ui/action-stack";
import { FormField } from "../../shared/ui/form-field";
import { InlineMessage } from "../../shared/ui/inline-message";
import { ScreenContainer } from "../../shared/ui/screen-container";
import {
  type AuthSettingsFormValues,
  authSettingsSchema,
} from "./auth-settings-schema";
import { useSignIn } from "./use-sign-in";

/**
 * Pixela の接続情報（username/token）を入力・保存する画面。
 */
export const AuthSettingsScreen = () => {
  const router = useRouter();
  const signInMutation = useSignIn();
  const { credentials: authCredentials, hasLoadError } = useAuthSession();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
  } = useForm<AuthSettingsFormValues>({
    defaultValues: {
      token: "",
      username: "",
    },
    resolver: zodResolver(authSettingsSchema),
  });

  useEffect(() => {
    if (authCredentials) {
      reset(authCredentials);
    }
  }, [authCredentials, reset]);

  const loadError = hasLoadError
    ? "保存済みの接続情報を読み込めませんでした。"
    : null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signInMutation.mutateAsync(values);
      router.replace("/(tabs)/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ログインに失敗しました。username/tokenを確認して再度お試しください。";
      setError("root", {
        message,
      });
    }
  });

  return (
    <ScreenContainer contentClassName="justify-center">
      {/* 画面ヘッダー: ログイン入力の案内 */}
      <Text className="mb-2 font-bold text-2xl text-neutral-900">ログイン</Text>
      <Text className="mb-6 text-neutral-600">
        Pixelaのusernameとtokenを入力してください。
      </Text>

      {/* Username入力 */}
      <FormField errorMessage={errors.username?.message} label="Username">
        <Controller
          control={control}
          name="username"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              className="text-base"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="your-username"
              testID="auth-sign-in-username-input"
              value={value}
              variant="secondary"
            />
          )}
        />
      </FormField>

      {/* Token入力 */}
      <FormField errorMessage={errors.token?.message} label="Token">
        <Controller
          control={control}
          name="token"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              className="text-base"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="pixela-token"
              secureTextEntry
              testID="auth-sign-in-token-input"
              value={value}
              variant="secondary"
            />
          )}
        />
      </FormField>

      {/* 保存済み認証情報の読込失敗エラー */}
      {loadError ? (
        <InlineMessage className="mb-4" message={loadError} variant="error" />
      ) : null}
      {/* API失敗時のフォーム共通エラー */}
      {errors.root?.message ? (
        <InlineMessage
          className="mb-4"
          message={errors.root.message}
          variant="error"
        />
      ) : null}

      {/* 画面アクション: ログイン実行 / サインアップ画面へ遷移 */}
      <ActionStack>
        <Button
          isDisabled={signInMutation.isPending}
          onPress={onSubmit}
          testID="auth-sign-in-submit-button"
        >
          ログイン
        </Button>
        <Button
          onPress={() => {
            router.replace("/auth/sign-up");
          }}
        >
          アカウント作成へ
        </Button>
      </ActionStack>
    </ScreenContainer>
  );
};
