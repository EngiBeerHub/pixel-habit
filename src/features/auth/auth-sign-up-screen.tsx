import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Button, Input } from "heroui-native";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text } from "react-native";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import { appRoutes } from "../../shared/config/routes";
import { navigateToTabWithRecovery } from "../../shared/navigation/tab-navigation-fallback";
import { ActionStack } from "../../shared/ui/action-stack";
import { useAppDialog } from "../../shared/ui/app-dialog-provider";
import { FormField } from "../../shared/ui/form-field";
import { InlineMessage } from "../../shared/ui/inline-message";
import { ScreenContainer } from "../../shared/ui/screen-container";
import {
  type AuthSignUpFormValues,
  authSignUpSchema,
} from "./auth-sign-up-schema";
import { useSignUp } from "./use-sign-up";

/**
 * Pixelaアカウントを作成してログイン状態へ遷移する画面。
 */
export const AuthSignUpScreen = () => {
  const router = useRouter();
  const { open } = useAppDialog();
  const signUpMutation = useSignUp();
  const { credentials, setAuthSession, status } = useAuthSession();
  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<AuthSignUpFormValues>({
    defaultValues: {
      token: "",
      username: "",
    },
    resolver: zodResolver(authSignUpSchema),
  });

  useEffect(() => {
    if (status === "authenticated" && credentials) {
      navigateToTabWithRecovery({
        openDialog: open,
        replace: router.replace,
        targetRoute: appRoutes.homeTab,
      });
    }
  }, [credentials, open, router, status]);

  /**
   * アカウント作成処理を実行する。
   */
  const onSubmit = handleSubmit(async (values) => {
    try {
      const nextCredentials = await signUpMutation.mutateAsync(values);
      await setAuthSession(nextCredentials);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "アカウント作成に失敗しました。再度お試しください。";
      setError("root", { message });
    }
  });

  return (
    <ScreenContainer contentClassName="justify-center">
      {/* 画面ヘッダー: 目的と入力ガイダンス */}
      <Text className="mb-2 font-bold text-2xl text-neutral-900">
        アカウント作成
      </Text>
      <Text className="mb-6 text-neutral-600">
        username と token を入力して作成します。
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
              value={value}
              variant="secondary"
            />
          )}
        />
      </FormField>

      {/* API失敗時のフォーム共通エラー */}
      {errors.root?.message ? (
        <InlineMessage
          className="mb-4"
          message={errors.root.message}
          variant="error"
        />
      ) : null}

      {/* 画面アクション: 作成実行 / ログイン画面へ戻る */}
      <ActionStack>
        <Button isDisabled={signUpMutation.isPending} onPress={onSubmit}>
          作成して開始
        </Button>
        <Button
          onPress={() => {
            // 認証画面間の移動は通常導線としてpushを使い、戻る操作を可能にする。
            router.push("/auth/sign-in");
          }}
        >
          ログインへ
        </Button>
      </ActionStack>
    </ScreenContainer>
  );
};
