import { Button, Tabs } from "heroui-native";
import { ActivityIndicator, Text, View } from "react-native";
import {
  borderTokens,
  surfaceTokens,
  textTokens,
} from "../../shared/config/ui-tokens";
import { mergeClassNames } from "../../shared/lib/class-name";
import { formatPixelaDateForShortDisplay } from "../../shared/lib/pixela-date";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";
import { GraphRecordList } from "./components/graph-record-list";
import { useGraphRecordListScreen } from "./hooks/use-graph-record-list-screen";

const FILTER_TABS = [
  { key: "all", label: "すべて" },
  { key: "memo", label: "メモあり" },
] as const;

/**
 * Graph ごとの記録一覧画面。
 */
export const GraphRecordListScreen = () => {
  const {
    errorMessage,
    graphUnit,
    isMemoOnly,
    isPending,
    latestRecordDateLabel,
    onChangeMemoFilter,
    onPressOpenPixelDetail,
    pixels,
    query,
    visibleCountLabel,
  } = useGraphRecordListScreen();

  return (
    <ScreenContainer
      contentClassName={mergeClassNames("gap-4", surfaceTokens.screenClass)}
      scrollable
      withTopInset={false}
    >
      {isPending ? (
        <View className="items-center justify-center py-6">
          <ActivityIndicator />
          <Text className={mergeClassNames("mt-2", textTokens.secondaryClass)}>
            読み込み中...
          </Text>
        </View>
      ) : null}

      {!isPending && errorMessage ? (
        <SectionCard
          className={mergeClassNames(
            "rounded-3xl border",
            borderTokens.dangerClass
          )}
          tone="danger"
        >
          <View className="gap-3">
            <Text
              className={mergeClassNames("text-sm", textTokens.dangerClass)}
            >
              {errorMessage}
            </Text>
            <Button
              onPress={() => {
                query.refetch();
              }}
              size="sm"
              testID="graph-record-list-retry"
              variant="secondary"
            >
              再試行
            </Button>
          </View>
        </SectionCard>
      ) : null}

      {isPending || errorMessage ? null : (
        <>
          <Tabs
            onValueChange={(value) => {
              onChangeMemoFilter(value === "memo");
            }}
            value={isMemoOnly ? "memo" : "all"}
            variant="primary"
          >
            <Tabs.List testID="graph-record-filter">
              <Tabs.Indicator />
              {FILTER_TABS.map((filterTab) => (
                <Tabs.Trigger
                  key={filterTab.key}
                  onPress={() => {
                    onChangeMemoFilter(filterTab.key === "memo");
                  }}
                  testID={`graph-record-filter-${filterTab.key}`}
                  value={filterTab.key}
                >
                  {({ isSelected }) => (
                    <Tabs.Label
                      className={mergeClassNames(
                        "font-medium text-sm",
                        isSelected
                          ? textTokens.primaryClass
                          : textTokens.secondaryClass
                      )}
                    >
                      {filterTab.label}
                    </Tabs.Label>
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value="all" />
            <Tabs.Content value="memo" />
          </Tabs>

          <SectionCard
            className={mergeClassNames(
              "rounded-3xl border border-neutral-200 bg-white"
            )}
          >
            <View className="gap-1">
              <Text
                className={mergeClassNames("text-xs", textTokens.mutedClass)}
              >
                最新記録
              </Text>
              <Text
                className={mergeClassNames(
                  "font-semibold text-2xl",
                  textTokens.primaryClass
                )}
                testID="graph-record-latest-date"
              >
                {formatPixelaDateForShortDisplay(latestRecordDateLabel)}
              </Text>
            </View>
          </SectionCard>

          <SectionCard
            className={mergeClassNames(
              "rounded-3xl border border-neutral-200 bg-white"
            )}
          >
            <View className="gap-3">
              <View className="flex-row items-center justify-between gap-3">
                <Text
                  className={mergeClassNames(
                    "font-semibold text-base",
                    textTokens.primaryClass
                  )}
                >
                  日別の記録
                </Text>
                <Text
                  className={mergeClassNames(
                    "font-medium text-xs",
                    textTokens.mutedClass
                  )}
                  testID="graph-record-visible-count"
                >
                  {visibleCountLabel}
                </Text>
              </View>

              <GraphRecordList
                emptyMessage={
                  isMemoOnly
                    ? "メモ付きの記録はまだありません。"
                    : "記録はまだありません。"
                }
                graphUnit={graphUnit}
                onPressRecord={onPressOpenPixelDetail}
                pixels={pixels}
              />
            </View>
          </SectionCard>
        </>
      )}
    </ScreenContainer>
  );
};
