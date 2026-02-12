import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import { showAlert } from "../../shared/platform/app-alert";
import { type PixelEditFormValues, pixelEditSchema } from "./pixel-edit-schema";

/**
 * 指定ピクセルの更新・削除を行う画面。
 */
export const PixelDetailScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    date?: string;
    graphId?: string;
    graphName?: string;
    quantity?: string;
  }>();
  const [message, setMessage] = useState<string | null>(null);
  const graphId = typeof params.graphId === "string" ? params.graphId : "";
  const graphName =
    typeof params.graphName === "string" ? params.graphName : "";
  const date = typeof params.date === "string" ? params.date : "";
  const initialQuantity =
    typeof params.quantity === "string" ? params.quantity : "";
  const api = useAuthedPixelaApi();

  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<PixelEditFormValues>({
    defaultValues: {
      quantity: initialQuantity,
    },
    resolver: zodResolver(pixelEditSchema),
  });

  const updateMutation = useMutation({
    mutationFn: (values: PixelEditFormValues) => {
      if (!(graphId && date)) {
        throw new Error("graphIdまたはdateが不正です。");
      }
      return api.updatePixel({
        date,
        graphId,
        quantity: values.quantity,
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "記録更新に失敗しました。再度お試しください。";
      setError("root", { message: errorMessage });
      setMessage(null);
    },
    onSuccess: async (response) => {
      setMessage(response.message);
      await queryClient.invalidateQueries({
        queryKey: ["pixels", graphId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!(graphId && date)) {
        throw new Error("graphIdまたはdateが不正です。");
      }
      return api.deletePixel({
        date,
        graphId,
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "記録削除に失敗しました。再度お試しください。";
      setError("root", { message: errorMessage });
      setMessage(null);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["pixels", graphId],
      });
      showAlert("削除完了", response.message, [
        {
          onPress: () => {
            router.back();
          },
          text: "OK",
        },
      ]);
    },
  });

  /**
   * ピクセル更新を実行する。
   */
  const onSubmitUpdate = handleSubmit((values) => {
    updateMutation.mutate(values);
  });

  /**
   * ピクセル削除確認ダイアログを表示する。
   */
  const onPressDelete = () => {
    showAlert(
      "記録削除",
      `${date} の記録を削除しますか？この操作は取り消せません。`,
      [
        {
          style: "cancel",
          text: "キャンセル",
        },
        {
          onPress: () => {
            deleteMutation.mutate();
          },
          style: "destructive",
          text: "削除する",
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-6">
      {/* 画面ヘッダー: 編集対象ピクセルの文脈情報 */}
      <Text className="font-bold text-2xl text-neutral-900">
        {graphName || "記録編集"}
      </Text>
      <Text className="mt-2 text-neutral-600">グラフID: {graphId || "-"}</Text>
      <Text className="mb-6 text-neutral-600">日付: {date || "-"}</Text>

      {/* 数量入力 */}
      <Text className="mb-2 text-neutral-800">数量</Text>
      <Controller
        control={control}
        name="quantity"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            className="mb-2 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            keyboardType="decimal-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="10"
            value={value}
          />
        )}
      />
      {/* 数量バリデーションエラー */}
      {errors.quantity?.message ? (
        <Text className="mb-4 text-red-600 text-sm">
          {errors.quantity.message}
        </Text>
      ) : (
        <View className="mb-4" />
      )}

      {/* API失敗時のフォーム共通エラー */}
      {errors.root?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.root.message}</Text>
      ) : null}
      {/* API成功メッセージ */}
      {message ? (
        <Text className="mb-4 text-green-700 text-sm">{message}</Text>
      ) : null}

      {/* 画面アクション: 更新 / 削除 / 一覧へ戻る */}
      <View className="gap-3">
        <Button
          isDisabled={updateMutation.isPending || deleteMutation.isPending}
          onPress={onSubmitUpdate}
        >
          更新
        </Button>
        <Button
          isDisabled={updateMutation.isPending || deleteMutation.isPending}
          onPress={onPressDelete}
        >
          削除
        </Button>
        <Button onPress={router.back}>一覧へ戻る</Button>
      </View>
    </View>
  );
};
