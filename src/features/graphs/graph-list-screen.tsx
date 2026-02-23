import { type ReactNode, useCallback, useMemo } from "react";
import {
  FlatList,
  type ListRenderItemInfo,
  RefreshControl,
} from "react-native";
import type { GraphDefinition } from "../../shared/api/graph";
import { surfaceTokens } from "../../shared/config/ui-tokens";
import { mergeClassNames } from "../../shared/lib/class-name";
import { GraphCard } from "./components/graph-card";
import { GraphListStates } from "./components/graph-list-states";
import { QuickAddSheet } from "./components/quick-add-sheet";
import { useGraphListScreen } from "./hooks/use-graph-list-screen";

/**
 * 認証情報を使って Pixela のグラフ一覧を表示する画面。
 */
export const GraphListScreen = () => {
  const {
    addPixelMutation,
    api,
    control,
    errorMessage,
    isGraphListLoading,
    isPullRefreshing,
    isQuickAddOpen,
    onPressAddForDate,
    onPressAddToday,
    onPressOpenDetail,
    onQuickAddOpenChange,
    onRefresh,
    onRetry,
    onSubmitQuickAdd,
    pixelFormErrors,
    query,
    selectedGraph,
  } = useGraphListScreen();

  const hasGraphs = Boolean(query.data && query.data.length > 0);
  const shouldShowSkeleton = isGraphListLoading;
  const shouldShowError = !isGraphListLoading && Boolean(errorMessage);
  const canRenderDataState = !(isGraphListLoading || errorMessage);
  const shouldShowEmpty = canRenderDataState && !hasGraphs;
  const shouldShowGraphList = canRenderDataState && hasGraphs;

  const listEmptyComponent: ReactNode = useMemo(() => {
    if (shouldShowSkeleton) {
      return <GraphListStates mode="loading" />;
    }
    if (shouldShowError) {
      return (
        <GraphListStates
          errorMessage={errorMessage}
          mode="error"
          onRetry={onRetry}
        />
      );
    }
    if (shouldShowEmpty) {
      return <GraphListStates mode="empty" />;
    }
    return null;
  }, [
    errorMessage,
    onRetry,
    shouldShowEmpty,
    shouldShowError,
    shouldShowSkeleton,
  ]);

  const graphData = useMemo(() => {
    if (!shouldShowGraphList) {
      return [];
    }
    return query.data ?? [];
  }, [query.data, shouldShowGraphList]);

  const keyExtractor = useCallback((item: GraphDefinition) => item.id, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<GraphDefinition>) => {
      if (!api.isAuthenticated) {
        return null;
      }

      return (
        <GraphCard
          graph={item}
          isActionDisabled={addPixelMutation.isPending}
          onPressAddForDate={onPressAddForDate}
          onPressAddToday={onPressAddToday}
          onPressOpenDetail={onPressOpenDetail}
        />
      );
    },
    [
      addPixelMutation.isPending,
      api.isAuthenticated,
      onPressAddForDate,
      onPressAddToday,
      onPressOpenDetail,
    ]
  );

  return (
    <>
      <FlatList<GraphDefinition>
        automaticallyAdjustContentInsets
        className={mergeClassNames("flex-1", surfaceTokens.screenClass)}
        contentContainerClassName="px-6 pb-6 pt-2"
        contentInsetAdjustmentBehavior="automatic"
        data={graphData}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmptyComponent}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={isPullRefreshing} />
        }
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
      <QuickAddSheet
        control={control}
        isOpen={isQuickAddOpen}
        isSubmitting={addPixelMutation.isPending}
        onOpenChange={onQuickAddOpenChange}
        onSubmit={onSubmitQuickAdd}
        pixelFormErrors={pixelFormErrors}
        selectedGraph={selectedGraph}
      />
    </>
  );
};
