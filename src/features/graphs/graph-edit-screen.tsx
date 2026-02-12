import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TextInput, View } from "react-native";
import {
  type GraphColor,
  graphColorOptions,
  updateGraph,
} from "../../shared/api/graph";
import { useAuthCredentialsQuery } from "../../shared/auth/use-auth-credentials-query";
import { loadAuthCredentials } from "../../shared/storage/auth-storage";
import { type GraphEditFormValues, graphEditSchema } from "./graph-edit-schema";

/**
 * グラフ設定を編集する画面。
 */
export const GraphEditScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    color?: string;
    graphId?: string;
    graphName?: string;
    timezone?: string;
    unit?: string;
  }>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const graphId = typeof params.graphId === "string" ? params.graphId : "";
  const initialName =
    typeof params.graphName === "string" ? params.graphName : "";
  const initialTimezone =
    typeof params.timezone === "string" ? params.timezone : "Asia/Tokyo";
  const initialUnit = typeof params.unit === "string" ? params.unit : "";
  const initialColor = toGraphColor(params.color);
  const authQuery = useAuthCredentialsQuery();
  const credentials = authQuery.data ?? null;
  const graphIdError = useMemo(() => {
    if (graphId) {
      return null;
    }
    return "グラフIDが不正です。Home画面からやり直してください。";
  }, [graphId]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<GraphEditFormValues>({
    defaultValues: {
      color: initialColor,
      name: initialName,
      timezone: initialTimezone,
      unit: initialUnit,
    },
    resolver: zodResolver(graphEditSchema),
  });

  const mutation = useMutation({
    mutationFn: async (values: GraphEditFormValues) => {
      const currentCredentials = credentials ?? (await loadAuthCredentials());
      if (!currentCredentials) {
        throw new Error("認証情報が見つかりません。再ログインしてください。");
      }
      if (!graphId) {
        throw new Error("グラフIDが不正です。Home画面からやり直してください。");
      }

      return updateGraph({
        color: values.color,
        graphId,
        name: values.name.trim(),
        timezone: values.timezone.trim(),
        token: currentCredentials.token,
        unit: values.unit.trim(),
        username: currentCredentials.username,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "グラフ更新に失敗しました。再度お試しください。";
      setError("root", { message });
      setSuccessMessage(null);
    },
    onSuccess: (response) => {
      setSuccessMessage(response.message);
    },
  });

  /**
   * グラフ更新を実行する。
   */
  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16 pb-6">
      {/* 画面ヘッダー: 編集対象グラフの文脈情報 */}
      <Text className="mb-2 font-bold text-2xl text-neutral-900">
        グラフ編集
      </Text>
      <Text className="mb-6 text-neutral-600">ID: {graphId || "-"}</Text>

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
            placeholder="グラフ名"
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
            placeholder="回, km, page など"
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

      {/* 事前チェックエラー（不正なgraphId等） */}
      {graphIdError ? (
        <Text className="mb-4 text-red-600 text-sm">{graphIdError}</Text>
      ) : null}
      {/* API失敗時のフォーム共通エラー */}
      {errors.root?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.root.message}</Text>
      ) : null}
      {/* API成功メッセージ */}
      {successMessage ? (
        <Text className="mb-4 text-green-700 text-sm">{successMessage}</Text>
      ) : null}

      {/* 画面アクション: 保存実行 / Homeへ戻る */}
      <View className="gap-3">
        <Button
          isDisabled={mutation.isPending || Boolean(graphIdError)}
          onPress={onSubmit}
        >
          保存
        </Button>
        <Button onPress={router.back}>Homeへ戻る</Button>
      </View>
    </ScrollView>
  );
};

/**
 * URLパラメータ値をGraphColorへ正規化する。
 */
const toGraphColor = (value: string | undefined): GraphColor => {
  if (!value) {
    return "shibafu";
  }

  if (graphColorOptions.includes(value as GraphColor)) {
    return value as GraphColor;
  }

  return "shibafu";
};
