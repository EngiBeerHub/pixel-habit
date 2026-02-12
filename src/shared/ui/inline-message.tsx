import { Text, View } from "react-native";
import { colorTokens } from "../config/ui-tokens";
import { mergeClassNames } from "../lib/class-name";

/**
 * 画面内に表示するインラインメッセージの種類。
 */
export type InlineMessageVariant = "error" | "info" | "success";

/**
 * InlineMessageコンポーネントの入力値。
 */
export interface InlineMessageProps {
  className?: string;
  message: string;
  variant: InlineMessageVariant;
}

/**
 * 成功/失敗/補足メッセージを統一トーンで表示する。
 */
export const InlineMessage = ({
  className,
  message,
  variant,
}: InlineMessageProps) => {
  if (variant === "info") {
    return (
      <Text
        className={mergeClassNames(
          "text-sm",
          colorTokens.infoTextClass,
          className
        )}
      >
        {message}
      </Text>
    );
  }

  const toneClassNames =
    variant === "success"
      ? {
          background: colorTokens.successBackgroundClass,
          border: colorTokens.successBorderClass,
          text: colorTokens.successTextClass,
        }
      : {
          background: colorTokens.dangerBackgroundClass,
          border: colorTokens.dangerBorderClass,
          text: colorTokens.dangerTextClass,
        };

  return (
    <View
      className={mergeClassNames(
        "rounded-lg border p-3",
        toneClassNames.background,
        toneClassNames.border,
        className
      )}
    >
      <Text className={mergeClassNames("text-sm", toneClassNames.text)}>
        {message}
      </Text>
    </View>
  );
};
