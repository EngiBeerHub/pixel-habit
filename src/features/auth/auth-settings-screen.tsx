import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import {
  type AuthCredentials,
  loadAuthCredentials,
  saveAuthCredentials,
} from "../../shared/storage/auth-storage";
import {
  type AuthSettingsFormValues,
  authSettingsSchema,
} from "./auth-settings-schema";

/**
 * Pixela の接続情報（username/token）を入力・保存する画面。
 */
export const AuthSettingsScreen = () => {
  const router = useRouter();
  const [loadError, setLoadError] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
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
      const credentials: AuthCredentials = {
        token: values.token.trim(),
        username: values.username.trim(),
      };
      await saveAuthCredentials(credentials);
      router.push("/graphs");
    } catch {
      setError("root", {
        message: "接続情報の保存に失敗しました。再度お試しください。",
      });
    }
  });

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 font-bold text-2xl text-neutral-900">接続設定</Text>
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

      <Button isDisabled={isSubmitting} onPress={onSubmit}>
        保存して続行
      </Button>
    </View>
  );
};
