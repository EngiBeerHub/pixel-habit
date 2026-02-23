import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button, Input } from "heroui-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import { graphColorOptions, graphTypeOptions } from "../../shared/api/graph";
import {
  invalidateGraphRelatedQueries,
  refetchGraphListQueries,
} from "../../shared/api/invalidation";
import { ActionStack } from "../../shared/ui/action-stack";
import { FormField } from "../../shared/ui/form-field";
import { InlineMessage } from "../../shared/ui/inline-message";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";
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
  const api = useAuthedPixelaApi();
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
    mutationFn: (values: GraphCreateFormValues) => {
      return api.createGraph({
        color: values.color,
        id: values.id.trim(),
        name: values.name.trim(),
        timezone: values.timezone.trim(),
        type: values.type,
        unit: values.unit.trim(),
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
      await invalidateGraphRelatedQueries(queryClient, api.username);
      await refetchGraphListQueries(queryClient);
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
    <ScreenContainer contentClassName="gap-4" scrollable withTopInset={false}>
      <SectionCard title="グラフ作成">
        <Text className="mb-4 text-neutral-600">
          必須項目を入力して新しいグラフを作成します。
        </Text>

        <View className="gap-3">
          <FormField errorMessage={errors.id?.message} label="ID">
            <Controller
              control={control}
              name="id"
              render={({ field: { onBlur, onChange, value } }) => (
                <Input
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="habit-graph"
                  value={value}
                  variant="secondary"
                />
              )}
            />
          </FormField>

          <FormField errorMessage={errors.name?.message} label="グラフ名">
            <Controller
              control={control}
              name="name"
              render={({ field: { onBlur, onChange, value } }) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="読書"
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
                  placeholder="page"
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

          <FormField label="種別">
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-2">
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
          <Button isDisabled={mutation.isPending} onPress={onSubmit}>
            作成
          </Button>
        </ActionStack>
      </SectionCard>
    </ScreenContainer>
  );
};
