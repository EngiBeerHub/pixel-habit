import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { spacingTokens, surfaceTokens } from "../config/ui-tokens";
import { mergeClassNames } from "../lib/class-name";

/**
 * ScreenContainerコンポーネントの入力値。
 */
export interface ScreenContainerProps {
  children: ReactNode;
  contentClassName?: string;
  scrollable?: boolean;
  withTopInset?: boolean;
}

/**
 * 画面共通の余白・背景・スクロール可否を統一する。
 */
export const ScreenContainer = ({
  children,
  contentClassName,
  scrollable = false,
  withTopInset = true,
}: ScreenContainerProps) => {
  const contentClassNames = mergeClassNames(
    spacingTokens.screenHorizontalClass,
    withTopInset ? spacingTokens.screenPaddingTopClass : "pt-6",
    spacingTokens.screenPaddingBottomClass,
    contentClassName
  );

  if (scrollable) {
    return (
      <ScrollView
        className={mergeClassNames("flex-1", surfaceTokens.screenClass)}
        contentContainerClassName={contentClassNames}
        contentInsetAdjustmentBehavior="automatic"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      className={mergeClassNames(
        "flex-1",
        surfaceTokens.screenClass,
        contentClassNames
      )}
    >
      {children}
    </View>
  );
};
