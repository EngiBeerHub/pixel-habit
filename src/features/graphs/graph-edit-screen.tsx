import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Button, Input } from "heroui-native";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import { type GraphColor, graphColorOptions } from "../../shared/api/graph";
import { ActionStack } from "../../shared/ui/action-stack";
import { FormField } from "../../shared/ui/form-field";
import { InlineMessage } from "../../shared/ui/inline-message";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";
import { type GraphEditFormValues, graphEditSchema } from "./graph-edit-schema";

/**
 * グラフ設定を編集する画面。
 */
export const GraphEditScreen = () => {
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
  const api = useAuthedPixelaApi();
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
    mutationFn: (values: GraphEditFormValues) => {
      if (!graphId) {
        throw new Error("グラフIDが不正です。Home画面からやり直してください。");
      }

      return api.updateGraph({
        color: values.color,
        graphId,
        name: values.name.trim(),
        timezone: values.timezone.trim(),
        unit: values.unit.trim(),
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
    <ScreenContainer contentClassName="gap-4" scrollable withTopInset={false}>
      <SectionCard>
        <View className="gap-3">
          <FormField errorMessage={errors.name?.message} label="グラフ名">
            <Controller
              control={control}
              name="name"
              render={({ field: { onBlur, onChange, value } }) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="グラフ名"
                  value={value}
                  variant="secondary"
                />
              )}
            />
          </FormField>

          <FormField errorMessage={errors.unit?.message} label="単位">
            <Controller
              control={control}
              name="unit"
              render={({ field: { onBlur, onChange, value } }) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="回, km, page など"
                  value={value}
                  variant="secondary"
                />
              )}
            />
          </FormField>

          <FormField
            errorMessage={errors.timezone?.message}
            label="タイムゾーン"
          >
            <Controller
              control={control}
              name="timezone"
              render={({ field: { onBlur, onChange, value } }) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Asia/Tokyo"
                  value={value}
                  variant="secondary"
                />
              )}
            />
          </FormField>

          <FormField label="テーマ色">
            <Controller
              control={control}
              name="color"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2">
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
          </FormField>
        </View>

        {graphIdError ? (
          <InlineMessage
            className="mt-4"
            message={graphIdError}
            variant="error"
          />
        ) : null}
        {errors.root?.message ? (
          <InlineMessage
            className="mt-4"
            message={errors.root.message}
            variant="error"
          />
        ) : null}
        {successMessage ? (
          <InlineMessage
            className="mt-4"
            message={successMessage}
            variant="success"
          />
        ) : null}

        <ActionStack className="mt-4">
          <Button
            isDisabled={mutation.isPending || Boolean(graphIdError)}
            onPress={onSubmit}
          >
            保存
          </Button>
        </ActionStack>
      </SectionCard>
    </ScreenContainer>
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
