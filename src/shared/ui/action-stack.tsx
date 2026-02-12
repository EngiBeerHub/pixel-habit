import type { ReactNode } from "react";
import { View } from "react-native";
import { spacingTokens } from "../config/ui-tokens";
import { mergeClassNames } from "../lib/class-name";

/**
 * ActionStackコンポーネントの入力値。
 */
export interface ActionStackProps {
  children: ReactNode;
  className?: string;
}

/**
 * ボタンなどのアクション群を縦方向に並べる。
 */
export const ActionStack = ({ children, className }: ActionStackProps) => {
  return (
    <View className={mergeClassNames(spacingTokens.sectionGapClass, className)}>
      {children}
    </View>
  );
};
