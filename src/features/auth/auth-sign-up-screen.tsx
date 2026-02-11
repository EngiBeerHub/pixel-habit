import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
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
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 font-bold text-2xl text-neutral-900">
        アカウント作成
      </Text>
      <Text className="mb-6 text-neutral-600">
        username と token を入力して作成します。
      </Text>

      <Text className="mb-2 text-neutral-800">Username</Text>
      <Controller
        control={control}
        name="username"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="mb-2 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="your-username"
            value={value}
          />
        )}
      />
      {errors.username ? (
        <Text className="mb-4 text-red-600 text-sm">
          {errors.username.message}
        </Text>
      ) : (
        <View className="mb-4" />
      )}

      <Text className="mb-2 text-neutral-800">Token</Text>
      <Controller
        control={control}
        name="token"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="mb-2 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="pixela-token"
            secureTextEntry
            value={value}
          />
        )}
      />
      {errors.token ? (
        <Text className="mb-4 text-red-600 text-sm">
          {errors.token.message}
        </Text>
      ) : (
        <View className="mb-4" />
      )}

      {errors.root?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.root.message}</Text>
      ) : null}

      <View className="gap-3">
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
      </View>
    </View>
  );
};
