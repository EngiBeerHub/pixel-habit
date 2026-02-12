import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TextInput, View } from "react-native";
import {
  createGraph,
  graphColorOptions,
  graphTypeOptions,
} from "../../shared/api/graph";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import { loadAuthCredentials } from "../../shared/storage/auth-storage";
import {
  type GraphCreateFormValues,
  graphCreateSchema,
} from "./graph-create-schema";

/**
 * 新しいグラフを作成する画面。
 */
export const GraphCreateScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { credentials } = useAuthSession();
  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<GraphCreateFormValues>({
    defaultValues: {
      color: "shibafu",
      id: "",
      name: "",
      timezone: "Asia/Tokyo",
      type: "int",
      unit: "",
    },
    resolver: zodResolver(graphCreateSchema),
  });

  const mutation = useMutation({
    mutationFn: async (values: GraphCreateFormValues) => {
      const currentCredentials = credentials ?? (await loadAuthCredentials());
      if (!currentCredentials) {
        throw new Error("認証情報が見つかりません。再ログインしてください。");
      }

      return createGraph({
        color: values.color,
        id: values.id.trim(),
        name: values.name.trim(),
        timezone: values.timezone.trim(),
        token: currentCredentials.token,
        type: values.type,
        unit: values.unit.trim(),
        username: currentCredentials.username,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "グラフ作成に失敗しました。再度お試しください。";
      setError("root", { message });
      setSuccessMessage(null);
    },
    onSuccess: async (response) => {
      setSuccessMessage(response.message);
      await queryClient.invalidateQueries({
        queryKey: ["graphs"],
      });
      router.back();
    },
  });

  /**
   * グラフ作成を実行する。
   */
  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16 pb-6">
      {/* 画面ヘッダー: 作成目的の説明 */}
      <Text className="mb-2 font-bold text-2xl text-neutral-900">
        グラフ作成
      </Text>
      <Text className="mb-6 text-neutral-600">
        必須項目を入力して新しいグラフを作成します。
      </Text>

      {/* ID入力 */}
      <Text className="mb-2 text-neutral-800">ID</Text>
      <Controller
        control={control}
        name="id"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="mb-2 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="habit-graph"
            value={value}
          />
        )}
      />
      {/* IDバリデーションエラー */}
      {errors.id?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.id.message}</Text>
      ) : (
        <View className="mb-4" />
      )}

      {/* グラフ名入力 */}
      <Text className="mb-2 text-neutral-800">グラフ名</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            className="mb-2 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="読書"
            value={value}
          />
        )}
      />
      {/* グラフ名バリデーションエラー */}
      {errors.name?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.name.message}</Text>
      ) : (
        <View className="mb-4" />
      )}

      {/* 単位入力 */}
      <Text className="mb-2 text-neutral-800">単位</Text>
      <Controller
        control={control}
        name="unit"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            className="mb-2 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="page"
            value={value}
          />
        )}
      />
      {/* 単位バリデーションエラー */}
      {errors.unit?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.unit.message}</Text>
      ) : (
        <View className="mb-4" />
      )}

      {/* タイムゾーン入力 */}
      <Text className="mb-2 text-neutral-800">タイムゾーン</Text>
      <Controller
        control={control}
        name="timezone"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            className="mb-2 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Asia/Tokyo"
            value={value}
          />
        )}
      />
      {/* タイムゾーンバリデーションエラー */}
      {errors.timezone?.message ? (
        <Text className="mb-4 text-red-600 text-sm">
          {errors.timezone.message}
        </Text>
      ) : (
        <View className="mb-4" />
      )}

      {/* 種別選択 */}
      <Text className="mb-2 text-neutral-800">種別</Text>
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <View className="mb-4 flex-row gap-2">
            {graphTypeOptions.map((type) => (
              <Button
                isDisabled={value === type}
                key={type}
                onPress={() => {
                  onChange(type);
                }}
              >
                {type}
              </Button>
            ))}
          </View>
        )}
      />

      {/* テーマ色選択 */}
      <Text className="mb-2 text-neutral-800">テーマ色</Text>
      <Controller
        control={control}
        name="color"
        render={({ field: { onChange, value } }) => (
          <View className="mb-4 flex-row flex-wrap gap-2">
            {graphColorOptions.map((color) => (
              <Button
                isDisabled={value === color}
                key={color}
                onPress={() => {
                  onChange(color);
                }}
              >
                {color}
              </Button>
            ))}
          </View>
        )}
      />

      {/* API失敗時のフォーム共通エラー */}
      {errors.root?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.root.message}</Text>
      ) : null}
      {/* API成功メッセージ */}
      {successMessage ? (
        <Text className="mb-4 text-green-700 text-sm">{successMessage}</Text>
      ) : null}

      {/* 画面アクション: 作成実行 / Homeへ戻る */}
      <View className="gap-3">
        <Button isDisabled={mutation.isPending} onPress={onSubmit}>
          作成
        </Button>
        <Button onPress={router.back}>Homeへ戻る</Button>
      </View>
    </ScrollView>
  );
};
