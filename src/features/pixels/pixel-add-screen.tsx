import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import { addPixel } from "../../shared/api/pixel";
import { loadAuthCredentials } from "../../shared/storage/auth-storage";
import { type PixelAddFormValues, pixelAddSchema } from "./pixel-add-schema";

/**
 * 指定グラフに日次記録を追加する画面。
 */
export const PixelAddScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    graphId?: string;
    graphName?: string;
  }>();
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const graphId = typeof params.graphId === "string" ? params.graphId : "";
  const graphName =
    typeof params.graphName === "string" ? params.graphName : "";
  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<PixelAddFormValues>({
    defaultValues: {
      date: getTodayAsYyyyMmDd(),
      quantity: "",
    },
    resolver: zodResolver(pixelAddSchema),
  });

  const mutation = useMutation({
    mutationFn: async (values: PixelAddFormValues) => {
      const credentials = await loadAuthCredentials();
      if (!credentials) {
        throw new Error(
          "接続情報が見つかりません。先に接続設定を行ってください。"
        );
      }
      if (!graphId) {
        throw new Error("グラフIDが不正です。一覧画面からやり直してください。");
      }

      return addPixel({
        date: values.date,
        graphId,
        quantity: values.quantity,
        token: credentials.token,
        username: credentials.username,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "記録の追加に失敗しました。再度お試しください。";
      setError("root", { message });
      setSubmitMessage(null);
    },
    onSuccess: (response) => {
      setSubmitMessage(response.message);
    },
  });

  const headingText = useMemo(() => {
    if (graphName.length > 0) {
      return `${graphName} に記録追加`;
    }
    return "記録追加";
  }, [graphName]);

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-6">
      <Text className="font-bold text-2xl text-neutral-900">{headingText}</Text>
      <Text className="mt-2 mb-6 text-neutral-600">
        グラフID: {graphId || "-"}
      </Text>

      <Text className="mb-2 text-neutral-800">日付 (yyyyMMdd)</Text>
      <Controller
        control={control}
        name="date"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="mb-2 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            keyboardType="number-pad"
            maxLength={8}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="20260211"
            value={value}
          />
        )}
      />
      {errors.date?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.date.message}</Text>
      ) : (
        <View className="mb-4" />
      )}

      <Text className="mb-2 text-neutral-800">数量</Text>
      <Controller
        control={control}
        name="quantity"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="mb-2 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            keyboardType="decimal-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="10"
            value={value}
          />
        )}
      />
      {errors.quantity?.message ? (
        <Text className="mb-4 text-red-600 text-sm">
          {errors.quantity.message}
        </Text>
      ) : (
        <View className="mb-4" />
      )}

      {errors.root?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.root.message}</Text>
      ) : null}
      {submitMessage ? (
        <Text className="mb-4 text-green-700 text-sm">{submitMessage}</Text>
      ) : null}

      <View className="gap-3">
        <Button isDisabled={mutation.isPending} onPress={onSubmit}>
          記録を追加
        </Button>
        <Button onPress={router.back}>一覧へ戻る</Button>
      </View>
    </View>
  );
};

/**
 * 端末の現在日付を Pixela 指定の `yyyyMMdd` 形式へ変換する。
 */
const getTodayAsYyyyMmDd = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};
