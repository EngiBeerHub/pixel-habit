import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import { loadAuthCredentials } from "../../shared/storage/auth-storage";
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
  const [loadError, setLoadError] = useState<string | null>(null);
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
    let isMounted = true;

    const hydrate = async () => {
      try {
        const credentials = await loadAuthCredentials();
        if (isMounted && credentials) {
          reset(credentials);
        }
      } catch {
        if (isMounted) {
          setLoadError("保存済みの接続情報を読み込めませんでした。");
        }
      }
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [reset]);

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
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 font-bold text-2xl text-neutral-900">ログイン</Text>
      <Text className="mb-6 text-neutral-600">
        Pixelaのusernameとtokenを入力してください。
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

      {loadError ? (
        <Text className="mb-4 text-red-600 text-sm">{loadError}</Text>
      ) : null}
      {errors.root?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.root.message}</Text>
      ) : null}

      <View className="gap-3">
        <Button isDisabled={signInMutation.isPending} onPress={onSubmit}>
          ログイン
        </Button>
        <Button
          onPress={() => {
            router.replace("/auth/sign-up");
          }}
        >
          アカウント作成へ
        </Button>
      </View>
    </View>
  );
};
