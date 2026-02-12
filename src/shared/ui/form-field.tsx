import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { colorTokens, spacingTokens } from "../config/ui-tokens";
import { mergeClassNames } from "../lib/class-name";

/**
 * FormFieldコンポーネントの入力値。
 */
export interface FormFieldProps {
  children: ReactNode;
  className?: string;
  errorMessage?: string | null;
  label: string;
}

/**
 * ラベル・入力・エラー表示を1単位で扱うフォーム行。
 */
export const FormField = ({
  children,
  className,
  errorMessage,
  label,
}: FormFieldProps) => {
  return (
    <View className={mergeClassNames(className)}>
      <Text className={mergeClassNames("mb-2", colorTokens.textTertiaryClass)}>
        {label}
      </Text>
      {children}
      {errorMessage ? (
        <Text
          className={mergeClassNames(
            "mt-2 text-sm",
            colorTokens.dangerTextClass
          )}
        >
          {errorMessage}
        </Text>
      ) : (
        <View className={spacingTokens.formFieldErrorMinHeightClass} />
      )}
    </View>
  );
};
