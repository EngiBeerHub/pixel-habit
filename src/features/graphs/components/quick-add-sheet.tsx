import { useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { BottomSheet, Button, Input, TextArea } from "heroui-native";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { NativeSyntheticEvent, TargetedEvent } from "react-native";
import { Text, View } from "react-native";
import type { GraphDefinition } from "../../../shared/api/graph";
import { normalizeYyyyMmDdInput } from "../../../shared/lib/date";
import type { PixelAddFormValues } from "../../pixels/pixel-add-schema";

/**
 * Quick Addシートの入力UIプロパティ。
 */
export interface QuickAddSheetProps {
  control: Control<PixelAddFormValues>;
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: () => void;
  pixelFormErrors: FieldErrors<PixelAddFormValues>;
  selectedGraph: GraphDefinition | null;
}

const QUICK_ADD_SHEET_SNAP_POINTS = ["70%"];

/**
 * Bottom Sheet配下で入力UIを描画する内部フォーム。
 *
 * `useBottomSheetInternal` はBottom Sheetコンテキスト内でのみ利用できるため、
 * フォームを子コンポーネントへ分離してhookの呼び出し位置を保証する。
 */
const QuickAddSheetForm = ({
  control,
  isSubmitting,
  onSubmit,
  pixelFormErrors,
  selectedGraph,
}: Omit<QuickAddSheetProps, "isOpen" | "onOpenChange">) => {
  const { animatedKeyboardState } = useBottomSheetInternal();

  /**
   * フォーカス中の入力をBottom Sheetへ通知し、キーボード追従を安定させる。
   */
  const onFocusInput = (event: NativeSyntheticEvent<TargetedEvent>) => {
    animatedKeyboardState.set((state) => ({
      ...state,
      target: event.nativeEvent.target,
    }));
  };

  /**
   * 対象入力のフォーカス解除時にキーボードターゲットをクリアする。
   */
  const onBlurInput = (event: NativeSyntheticEvent<TargetedEvent>) => {
    const keyboardState = animatedKeyboardState.get();
    if (keyboardState.target === event.nativeEvent.target) {
      animatedKeyboardState.set((state) => ({
        ...state,
        target: undefined,
      }));
    }
  };

  return (
    <>
      {/* シート見出し: 対象グラフ名を文脈として表示 */}
      <BottomSheet.Title className="font-semibold text-lg text-neutral-900">
        {selectedGraph ? `${selectedGraph.name} に記録追加` : "記録追加"}
      </BottomSheet.Title>

      {/* 日付入力: yyyyMMdd形式。入力時に正規化してフォーム値へ反映 */}
      <Text className="mt-2 text-neutral-800">日付 (yyyyMMdd) *</Text>
      <Controller
        control={control}
        name="date"
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            onBlur={(event) => {
              onBlurInput(event);
              onBlur();
            }}
            onChangeText={(text) => {
              onChange(normalizeYyyyMmDdInput(text));
            }}
            onFocus={onFocusInput}
            placeholder="20260211"
            testID="graph-quick-add-date-input"
            value={value}
            variant="secondary"
          />
        )}
      />
      {/* 日付バリデーションエラー */}
      {pixelFormErrors.date?.message ? (
        <Text className="text-red-600 text-sm">
          {pixelFormErrors.date.message}
        </Text>
      ) : null}

      {/* 数量入力 */}
      <Text className="mt-1 text-neutral-800">
        数量{selectedGraph?.unit ? ` (${selectedGraph.unit})` : ""} *
      </Text>
      <Controller
        control={control}
        name="quantity"
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            onBlur={(event) => {
              onBlurInput(event);
              onBlur();
            }}
            onChangeText={onChange}
            onFocus={onFocusInput}
            placeholder="10"
            testID="graph-quick-add-quantity-input"
            value={value}
            variant="secondary"
          />
        )}
      />
      {/* 数量バリデーションエラー */}
      {pixelFormErrors.quantity?.message ? (
        <Text className="text-red-600 text-sm">
          {pixelFormErrors.quantity.message}
        </Text>
      ) : null}

      {/* 任意メモ入力 */}
      <Text className="mt-1 text-neutral-800">メモ</Text>
      <Controller
        control={control}
        name="optionalData"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextArea
            onBlur={(event) => {
              onBlurInput(event);
              onBlur();
            }}
            onChangeText={onChange}
            onFocus={onFocusInput}
            placeholder="補足メモ"
            testID="graph-quick-add-optional-data-input"
            value={value}
            variant="secondary"
          />
        )}
      />

      {/* API失敗時のフォーム共通エラー */}
      {pixelFormErrors.root?.message ? (
        <Text className="text-red-600 text-sm">
          {pixelFormErrors.root.message}
        </Text>
      ) : null}

      {/* シート内アクション: 直接保存 */}
      <View className="mt-2">
        <Button
          isDisabled={isSubmitting}
          onPress={onSubmit}
          size="sm"
          testID="graph-quick-add-save-button"
          variant="primary"
        >
          保存
        </Button>
      </View>
    </>
  );
};

/**
 * Homeで記録追加を完結させるQuick Add Bottom Sheet。
 */
export const QuickAddSheet = ({
  control,
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
  pixelFormErrors,
  selectedGraph,
}: QuickAddSheetProps) => {
  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          contentContainerClassName="gap-2 px-6 pt-2 pb-4"
          enablePanDownToClose
          snapPoints={QUICK_ADD_SHEET_SNAP_POINTS}
        >
          <QuickAddSheetForm
            control={control}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            pixelFormErrors={pixelFormErrors}
            selectedGraph={selectedGraph}
          />
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
