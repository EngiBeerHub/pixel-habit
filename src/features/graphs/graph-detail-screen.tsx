import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useAuthedPixelaApi } from "../../shared/api/authed-pixela-api";
import type { Pixel } from "../../shared/api/pixel";
import { useAuthSession } from "../../shared/auth/use-auth-session";
import { borderTokens, textTokens } from "../../shared/config/ui-tokens";
import {
  type CalendarMode,
  formatCalendarModeLabel,
  getCalendarMonthRange,
  getCalendarYearRange,
} from "../../shared/lib/calendar-range";
import { mergeClassNames } from "../../shared/lib/class-name";
import { showAlert } from "../../shared/platform/app-alert";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";

/**
 * グラフ詳細画面で表示する軽量統計情報。
 */
interface GraphDetailSummary {
  maxQuantityText: string;
  positiveRecordCount: number;
  totalQuantityText: string;
}

/**
 * 記録一覧で表示するメモ要約の最大文字数。
 */
const RECORD_MEMO_PREVIEW_MAX_LENGTH = 24;

/**
 * Graph詳細画面。Month/Yearで記録を確認する。
 */
export const GraphDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    color?: string;
    graphId?: string;
    graphName?: string;
    timezone?: string;
    unit?: string;
  }>();
  const graphId = typeof params.graphId === "string" ? params.graphId : "";
  const graphName =
    typeof params.graphName === "string" ? params.graphName : "グラフ詳細";
  const graphColor = typeof params.color === "string" ? params.color : "";
  const graphTimezone =
    typeof params.timezone === "string" ? params.timezone : "Asia/Tokyo";
  const graphUnit = typeof params.unit === "string" ? params.unit : "";
  const [mode, setMode] = useState<CalendarMode>("month");
  const { credentials, hasLoadError, status } = useAuthSession();
  const api = useAuthedPixelaApi();

  const activeRange = useMemo(() => {
    if (mode === "month") {
      return getCalendarMonthRange();
    }
    return getCalendarYearRange();
  }, [mode]);

  const query = useQuery({
    enabled: Boolean(api.isAuthenticated && graphId) && status !== "loading",
    queryFn: () => {
      if (!graphId) {
        return [];
      }
      return api.getPixels({
        from: activeRange.from,
        graphId,
        to: activeRange.to,
      });
    },
    queryKey: ["graphDetailPixels", api.username, graphId, mode],
  });

  const errorMessage = useMemo(() => {
    if (hasLoadError) {
      return "認証情報の読み込みに失敗しました。";
    }
    if (status === "anonymous" && !credentials) {
      return "認証情報が見つかりません。再ログインしてください。";
    }
    if (!graphId) {
      return "グラフIDが不正です。Home画面からやり直してください。";
    }
    if (!query.error) {
      return null;
    }
    if (query.error instanceof Error) {
      return query.error.message;
    }
    return "記録一覧の取得に失敗しました。";
  }, [credentials, graphId, hasLoadError, query.error, status]);

  const pixels = useMemo(() => {
    if (!query.data) {
      return [];
    }
    return [...query.data].sort((a, b) => b.date.localeCompare(a.date));
  }, [query.data]);

  const summary = useMemo(() => {
    return buildGraphDetailSummary(pixels);
  }, [pixels]);

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!graphId) {
        throw new Error("グラフIDが不正です。Home画面からやり直してください。");
      }
      return api.deleteGraph({ graphId });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "グラフ削除に失敗しました。再度お試しください。";
      showAlert("削除エラー", message);
    },
    onSuccess: (response) => {
      showAlert("削除完了", response.message);
      router.replace("/(tabs)/home");
    },
  });

  const onPressOpenGraphActions = () => {
    showAlert(graphName, "操作を選択してください。", [
      {
        onPress: () => {
          router.push({
            params: {
              color: graphColor,
              graphId,
              graphName,
              timezone: graphTimezone,
              unit: graphUnit,
            },
            pathname: "/graphs/[graphId]/edit",
          });
        },
        text: "編集",
      },
      {
        onPress: () => {
          showAlert(
            "グラフ削除",
            `${graphName} を削除しますか？この操作は取り消せません。`,
            [
              {
                style: "cancel",
                text: "キャンセル",
              },
              {
                onPress: () => {
                  deleteMutation.mutate();
                },
                style: "destructive",
                text: "削除する",
              },
            ]
          );
        },
        style: "destructive",
        text: "削除",
      },
      {
        style: "cancel",
        text: "キャンセル",
      },
    ]);
  };

  /**
   * 選択した日付の記録詳細画面へ遷移する。
   */
  const onPressOpenPixelDetail = (pixel: Pixel) => {
    router.push({
      params: {
        date: pixel.date,
        graphId,
        graphName,
        optionalData: pixel.optionalData,
        quantity: pixel.quantity,
      },
      pathname: "/graphs/[graphId]/pixels/[date]",
    });
  };

  return (
    <ScreenContainer contentClassName="gap-4" scrollable withTopInset={false}>
      {/* 画面上部: タイトルと対象グラフ */}
      <View className="mb-1 flex-row items-center justify-between gap-2">
        <View className="flex-1 gap-2">
          <Text
            className={mergeClassNames(
              "font-bold text-2xl",
              textTokens.primaryClass
            )}
          >
            {graphName}
          </Text>
          <Text
            className={mergeClassNames("text-sm", textTokens.secondaryClass)}
          >
            ID: {graphId || "-"}
          </Text>
        </View>
        <Button
          isDisabled={deleteMutation.isPending || !graphId}
          isIconOnly
          onPress={onPressOpenGraphActions}
          size="sm"
          testID="graph-detail-menu-button"
          variant="tertiary"
        >
          <Ionicons name="ellipsis-horizontal" size={16} />
        </Button>
      </View>

      {/* 表示モード切替: Month=暦月、Year=暦年 */}
      <SectionCard>
        <View className="gap-3">
          <View className="flex-row gap-2">
            <Button
              isDisabled={mode === "month"}
              onPress={() => {
                setMode("month");
              }}
              size="sm"
              testID="graph-detail-mode-month"
              variant={mode === "month" ? "primary" : "secondary"}
            >
              Month
            </Button>
            <Button
              isDisabled={mode === "year"}
              onPress={() => {
                setMode("year");
              }}
              size="sm"
              testID="graph-detail-mode-year"
              variant={mode === "year" ? "primary" : "secondary"}
            >
              Year
            </Button>
          </View>
          <Text
            className={mergeClassNames("text-xs", textTokens.mutedClass)}
            testID="graph-detail-mode-help"
          >
            Month=暦月 / Year=暦年
          </Text>
          <Text
            className="text-neutral-700 text-sm"
            testID="graph-detail-range"
          >
            {formatCalendarModeLabel(mode)}: {activeRange.from} -{" "}
            {activeRange.to}
          </Text>
        </View>
      </SectionCard>

      {/* データ取得中 */}
      {query.isLoading ? (
        <View className="items-center justify-center py-6">
          <ActivityIndicator />
          <Text className={mergeClassNames("mt-2", textTokens.secondaryClass)}>
            読み込み中...
          </Text>
        </View>
      ) : null}

      {/* 取得失敗時の表示 */}
      {!query.isLoading && errorMessage ? (
        <SectionCard
          className={mergeClassNames("border", borderTokens.dangerClass)}
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
              testID="graph-detail-retry"
              variant="secondary"
            >
              再試行
            </Button>
          </View>
        </SectionCard>
      ) : null}

      {/* 取得成功時の統計と記録一覧 */}
      {query.isLoading || errorMessage ? null : (
        <View className="gap-3">
          <SectionCard title="Light統計">
            <View className="gap-1">
              <Text className="text-neutral-700 text-sm">
                合計: {summary.totalQuantityText}
              </Text>
              <Text className="text-neutral-700 text-sm">
                記録日数: {summary.positiveRecordCount}
              </Text>
              <Text className="text-neutral-700 text-sm">
                最大値: {summary.maxQuantityText}
              </Text>
            </View>
          </SectionCard>

          <SectionCard title="記録一覧">
            {pixels.length === 0 ? (
              <Text className="text-neutral-600 text-sm">
                この期間の記録はまだありません。
              </Text>
            ) : (
              <View className="gap-2">
                {pixels.map((pixel) => {
                  const memoPreview = toRecordMemoPreview(pixel.optionalData);
                  return (
                    <Pressable
                      className={mergeClassNames(
                        "rounded-xl border bg-neutral-50 px-3 py-3 active:opacity-80",
                        borderTokens.defaultClass
                      )}
                      key={pixel.date}
                      onPress={() => {
                        onPressOpenPixelDetail(pixel);
                      }}
                      testID={`graph-detail-record-${pixel.date}`}
                    >
                      {/**
                       * optionalData は一覧過密化を避けるため、要約が存在する行のみ表示する。
                       */}
                      {memoPreview ? (
                        <Text
                          className={mergeClassNames(
                            "mb-2 text-xs",
                            textTokens.mutedClass
                          )}
                          numberOfLines={1}
                          testID={`graph-detail-record-memo-${pixel.date}`}
                        >
                          {memoPreview}
                        </Text>
                      ) : null}
                      <View className="flex-row items-center justify-between">
                        <View className="gap-1">
                          <Text
                            className={mergeClassNames(
                              "font-medium text-sm",
                              textTokens.primaryClass
                            )}
                          >
                            {pixel.date}
                          </Text>
                          <Text
                            className={mergeClassNames(
                              "text-sm",
                              textTokens.secondaryClass
                            )}
                          >
                            数量: {pixel.quantity || "-"}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={14} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </SectionCard>
        </View>
      )}
    </ScreenContainer>
  );
};

/**
 * 取得済みピクセル配列からLight統計を算出する。
 */
const buildGraphDetailSummary = (pixels: Pixel[]): GraphDetailSummary => {
  const positiveValues = pixels
    .map((pixel) => Number(pixel.quantity))
    .filter((value) => Number.isFinite(value) && value >= 1);

  if (positiveValues.length === 0) {
    return {
      maxQuantityText: "-",
      positiveRecordCount: 0,
      totalQuantityText: "0",
    };
  }

  const total = positiveValues.reduce((sum, value) => sum + value, 0);
  const max = Math.max(...positiveValues);

  return {
    maxQuantityText: String(max),
    positiveRecordCount: positiveValues.length,
    totalQuantityText: String(total),
  };
};

/**
 * optionalData を一覧向けに要約テキストへ変換する。
 */
const toRecordMemoPreview = (memo: string | undefined): string | null => {
  if (!memo) {
    return null;
  }
  const trimmed = memo.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length <= RECORD_MEMO_PREVIEW_MAX_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, RECORD_MEMO_PREVIEW_MAX_LENGTH)}…`;
};
