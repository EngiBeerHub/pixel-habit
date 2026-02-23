import { Button, SkeletonGroup } from "heroui-native";
import type { ReactElement } from "react";
import { Text, View } from "react-native";
import { borderTokens, textTokens } from "../../../shared/config/ui-tokens";
import { mergeClassNames } from "../../../shared/lib/class-name";
import { SectionCard } from "../../../shared/ui/section-card";

const HOME_LOADING_SKELETON_KEYS = ["card-a", "card-b"] as const;

/**
 * グラフ一覧のプレースホルダー表示種別。
 */
export type GraphListStateMode = "empty" | "error" | "loading";

/**
 * 一覧状態表示コンポーネントの入力値。
 */
export interface GraphListStatesProps {
  errorMessage?: string | null;
  mode: GraphListStateMode;
  onRetry?: () => void;
}

/**
 * GraphListの loading / error / empty 表示を共通化する。
 */
export const GraphListStates = ({
  errorMessage,
  mode,
  onRetry,
}: GraphListStatesProps): ReactElement => {
  if (mode === "loading") {
    return (
      <View className="gap-3" testID="graph-list-loading-skeleton">
        {HOME_LOADING_SKELETON_KEYS.map((key) => (
          <SectionCard key={key}>
            <SkeletonGroup className="gap-3" isSkeletonOnly>
              <SkeletonGroup.Item className="h-7 w-36 rounded-full" />
              <SkeletonGroup.Item className="h-48 w-full rounded-xl" />
            </SkeletonGroup>
          </SectionCard>
        ))}
      </View>
    );
  }

  if (mode === "error") {
    return (
      <SectionCard
        className={mergeClassNames("border", borderTokens.dangerClass)}
        tone="danger"
      >
        <View className="gap-3">
          <Text className={textTokens.dangerClass}>{errorMessage}</Text>
          <Button onPress={onRetry} testID="graph-list-retry-button">
            再試行
          </Button>
        </View>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="bg-neutral-50">
      <Text className="text-neutral-700">グラフがまだ登録されていません。</Text>
    </SectionCard>
  );
};
