import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Input, TextArea } from "heroui-native";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import { useAppDialog } from "../../shared/ui/app-dialog-provider";
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
    optionalData?: string;
    quantity?: string;
  }>();
  const graphId = typeof params.graphId === "string" ? params.graphId : "";
  const graphName =
    typeof params.graphName === "string" ? params.graphName : "";
  const date = typeof params.date === "string" ? params.date : "";
  const initialQuantity =
    typeof params.quantity === "string" ? params.quantity : "";
  const initialOptionalData =
    typeof params.optionalData === "string" ? params.optionalData : "";
  const api = useAuthedPixelaApi();
  const { open: openDialog } = useAppDialog();

  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<PixelEditFormValues>({
    defaultValues: {
      optionalData: initialOptionalData,
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
        optionalData: values.optionalData,
        quantity: values.quantity,
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "記録更新に失敗しました。再度お試しください。";
      setError("root", { message: errorMessage });
    },
    onSuccess: async (response) => {
      await invalidatePixelRelatedQueries(queryClient);
      openDialog({
        actions: [
          {
            label: "OK",
            onPress: () => {
              router.back();
            },
          },
        ],
        description: response.message,
        title: "更新完了",
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
    },
    onSuccess: async (response) => {
      await invalidatePixelRelatedQueries(queryClient);
      openDialog({
        actions: [
          {
            label: "OK",
            onPress: () => {
              router.back();
            },
          },
        ],
        description: response.message,
        title: "削除完了",
      });
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
    openDialog({
      actions: [
        {
          label: "キャンセル",
          role: "cancel",
        },
        {
          label: "削除する",
          onPress: () => {
            deleteMutation.mutate();
          },
          role: "destructive",
        },
      ],
      description: `${date} の記録を削除しますか？この操作は取り消せません。`,
      dismissible: false,
      title: "記録削除",
    });
  };

  return (
    <View className="flex-1 bg-white px-6 pt-6 pb-6">
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
          <Input
            keyboardType="decimal-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="10"
            testID="pixel-detail-quantity-input"
            value={value}
            variant="secondary"
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

      {/* 任意メモ入力 */}
      <Text className="mb-2 text-neutral-800">メモ</Text>
      <Controller
        control={control}
        name="optionalData"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextArea
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="補足メモ"
            testID="pixel-detail-optional-data-input"
            value={value}
            variant="secondary"
          />
        )}
      />
      <View className="mb-4" />

      {/* API失敗時のフォーム共通エラー */}
      {errors.root?.message ? (
        <Text className="mb-4 text-red-600 text-sm">{errors.root.message}</Text>
      ) : null}

      {/* 画面アクション: 更新 / 削除 */}
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
          variant="danger-soft"
        >
          削除
        </Button>
      </View>
    </View>
  );
};

/**
 * 記録更新/削除後に関連クエリを再取得し、各画面の表示を同期する。
 */
const invalidatePixelRelatedQueries = async (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["graphDetailPixels"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["graphPixelsCompact"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["graphPixelsToday"],
    }),
  ]);
};
