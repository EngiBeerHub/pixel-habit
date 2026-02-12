import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Button, Input } from "heroui-native";
import { Controller, useForm } from "react-hook-form";
import { Text } from "react-native";
import { ActionStack } from "../../shared/ui/action-stack";
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
  const signUpMutation = useSignUp();
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

  /**
   * アカウント作成処理を実行する。
   */
  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUpMutation.mutateAsync(values);
      router.replace("/(tabs)/home");
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
            router.replace("/auth/sign-in");
          }}
        >
          ログインへ
        </Button>
      </ActionStack>
    </ScreenContainer>
  );
};
