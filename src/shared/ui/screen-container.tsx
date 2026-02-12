import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { colorTokens, spacingTokens } from "../config/ui-tokens";
import { mergeClassNames } from "../lib/class-name";

/**
 * ScreenContainerコンポーネントの入力値。
 */
export interface ScreenContainerProps {
  children: ReactNode;
  contentClassName?: string;
  scrollable?: boolean;
}

/**
 * 画面共通の余白・背景・スクロール可否を統一する。
 */
export const ScreenContainer = ({
  children,
  contentClassName,
  scrollable = false,
}: ScreenContainerProps) => {
  const contentClassNames = mergeClassNames(
    spacingTokens.screenHorizontalClass,
    spacingTokens.screenPaddingTopClass,
    spacingTokens.screenPaddingBottomClass,
    contentClassName
  );

  if (scrollable) {
    return (
      <ScrollView
        className={mergeClassNames("flex-1", colorTokens.screenBackgroundClass)}
        contentContainerClassName={contentClassNames}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      className={mergeClassNames(
        "flex-1",
        colorTokens.screenBackgroundClass,
        contentClassNames
      )}
    >
      {children}
    </View>
  );
};
