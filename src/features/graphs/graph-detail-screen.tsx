import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Button, Tabs } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
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
import { useAppDialog } from "../../shared/ui/app-dialog-provider";
import { ScreenContainer } from "../../shared/ui/screen-container";
import { SectionCard } from "../../shared/ui/section-card";

/**
 * Graph詳細画面で表示する統計情報。
 */
interface GraphDetailSummary {
  averagePerRecordedDayText: string;
  currentStreakDays: number;
  longestStreakDays: number;
  maxQuantityText: string;
  positiveRecordCount: number;
  totalQuantityText: string;
}

/**
 * 記録一覧で表示するメモ要約の最大文字数。
 */
const RECORD_MEMO_PREVIEW_MAX_LENGTH = 24;
const RECORD_MEMO_WHITESPACE_PATTERN = /\s+/g;
const YYYY_MM_DD_PATTERN = /^\d{8}$/;
const TRAILING_DECIMAL_ZERO_PATTERN = /\.?0+$/;

/**
 * Graph詳細画面。Month/Yearで記録を確認する。
 */
export const GraphDetailScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { open: openDialog } = useAppDialog();
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

  useEffect(() => {
    navigation.setOptions({
      title: graphName,
    });
  }, [graphName, navigation]);

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
      openDialog({
        actions: [{ label: "OK" }],
        description: message,
        title: "削除エラー",
      });
    },
    onSuccess: (response) => {
      openDialog({
        actions: [
          {
            label: "OK",
            onPress: () => {
              router.replace("/(tabs)/home");
            },
          },
        ],
        description: response.message,
        title: "削除完了",
      });
    },
  });

  /**
   * グラフ編集画面へ遷移する。
   */
  const onPressOpenGraphEdit = () => {
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
  };

  /**
   * グラフ削除確認ダイアログを表示する。
   */
  const onPressDeleteGraph = () => {
    openDialog({
      actions: [
        {
          label: "キャンセル",
          role: "cancel",
        },
        {
          label: "削除する",
          onPress: () => {
            deleteMutation.mutate();
          },
          role: "destructive",
        },
      ],
      description: `${graphName} を削除しますか？この操作は取り消せません。`,
      dismissible: false,
      title: "グラフ削除",
    });
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
      {/* 画面上部: タイトルと管理操作 */}
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
        <View className="flex-row items-center gap-2">
          <Button
            isDisabled={!graphId}
            isIconOnly
            onPress={onPressOpenGraphEdit}
            size="sm"
            testID="graph-detail-edit-button"
            variant="secondary"
          >
            <Ionicons name="create-outline" size={16} />
          </Button>
          <Button
            isDisabled={deleteMutation.isPending || !graphId}
            isIconOnly
            onPress={onPressDeleteGraph}
            size="sm"
            testID="graph-detail-delete-button"
            variant="danger-soft"
          >
            <Ionicons name="trash-outline" size={16} />
          </Button>
        </View>
      </View>

      {/* 表示モード切替: Month=暦月、Year=暦年 */}
      <SectionCard>
        <View className="gap-3">
          <Tabs
            onValueChange={(value) => {
              if (value === "month" || value === "year") {
                setMode(value);
              }
            }}
            value={mode}
            variant="primary"
          >
            <Tabs.List>
              <Tabs.Indicator />
              <Tabs.Trigger
                onPress={() => {
                  setMode("month");
                }}
                testID="graph-detail-mode-month"
                value="month"
              >
                <Tabs.Label>Month</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger
                onPress={() => {
                  setMode("year");
                }}
                testID="graph-detail-mode-year"
                value="year"
              >
                <Tabs.Label>Year</Tabs.Label>
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="month" />
            <Tabs.Content value="year" />
          </Tabs>
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
      {query.isPending ? (
        <View className="items-center justify-center py-6">
          <ActivityIndicator />
          <Text className={mergeClassNames("mt-2", textTokens.secondaryClass)}>
            読み込み中...
          </Text>
        </View>
      ) : null}

      {/* 取得失敗時の表示 */}
      {!query.isPending && errorMessage ? (
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
      {query.isPending || errorMessage ? null : (
        <View className="gap-3">
          <SectionCard title="統計">
            <View className="gap-1">
              <Text className="text-neutral-700 text-sm">
                合計: {summary.totalQuantityText}
              </Text>
              <Text className="text-neutral-700 text-sm">
                記録日数: {summary.positiveRecordCount}
              </Text>
              <Text className="text-neutral-700 text-sm">
                最大: {summary.maxQuantityText}
              </Text>
              <Text className="text-neutral-700 text-sm">
                平均(記録日): {summary.averagePerRecordedDayText}
              </Text>
              <Text className="text-neutral-700 text-sm">
                現在連続日数: {summary.currentStreakDays}
              </Text>
              <Text className="text-neutral-700 text-sm">
                最長連続日数: {summary.longestStreakDays}
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
                      <View className="flex-row items-start justify-between gap-2">
                        <Text
                          className={mergeClassNames(
                            "font-medium text-sm",
                            textTokens.primaryClass
                          )}
                        >
                          {formatRecordDate(pixel.date)}
                        </Text>
                        <Text
                          className={mergeClassNames(
                            "text-sm",
                            textTokens.secondaryClass
                          )}
                        >
                          {formatQuantityLabel(pixel.quantity, graphUnit)}
                        </Text>
                      </View>

                      {memoPreview ? (
                        <Text
                          className={mergeClassNames(
                            "mt-2 text-xs",
                            textTokens.mutedClass
                          )}
                          numberOfLines={1}
                          testID={`graph-detail-record-memo-${pixel.date}`}
                        >
                          {memoPreview}
                        </Text>
                      ) : null}
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
 * 取得済みピクセル配列からGraph詳細統計を算出する。
 */
const buildGraphDetailSummary = (pixels: Pixel[]): GraphDetailSummary => {
  const positiveEntries = pixels
    .map((pixel) => ({
      date: pixel.date,
      quantity: Number(pixel.quantity),
    }))
    .filter((entry) => Number.isFinite(entry.quantity) && entry.quantity >= 1);

  if (positiveEntries.length === 0) {
    return {
      averagePerRecordedDayText: "-",
      currentStreakDays: 0,
      longestStreakDays: 0,
      maxQuantityText: "-",
      positiveRecordCount: 0,
      totalQuantityText: "0",
    };
  }

  const total = positiveEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const max = Math.max(...positiveEntries.map((entry) => entry.quantity));
  const average = total / positiveEntries.length;

  const positiveDates = new Set(positiveEntries.map((entry) => entry.date));

  return {
    averagePerRecordedDayText: formatNumber(average),
    currentStreakDays: resolveCurrentStreak(positiveDates),
    longestStreakDays: resolveLongestStreak(positiveDates),
    maxQuantityText: formatNumber(max),
    positiveRecordCount: positiveEntries.length,
    totalQuantityText: formatNumber(total),
  };
};

/**
 * optionalData を一覧向けに要約テキストへ変換する。
 */
const toRecordMemoPreview = (memo: string | undefined): string | null => {
  if (!memo) {
    return null;
  }
  const trimmed = memo.replaceAll(RECORD_MEMO_WHITESPACE_PATTERN, " ").trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length <= RECORD_MEMO_PREVIEW_MAX_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, RECORD_MEMO_PREVIEW_MAX_LENGTH)}…`;
};

/**
 * `yyyyMMdd` を `yyyy/MM/dd (EEE)` へ整形する。
 */
const formatRecordDate = (value: string): string => {
  if (!YYYY_MM_DD_PATTERN.test(value)) {
    return value;
  }

  const parsedDate = parseYyyyMmDd(value);
  if (!parsedDate) {
    return value;
  }

  const weekday = parsedDate.toLocaleDateString("ja-JP", {
    weekday: "short",
  });
  const yyyy = value.slice(0, 4);
  const mm = value.slice(4, 6);
  const dd = value.slice(6, 8);
  return `${yyyy}/${mm}/${dd} (${weekday})`;
};

/**
 * 数量表示に単位を付与して返す。
 */
const formatQuantityLabel = (quantity: string, unit: string): string => {
  if (!quantity) {
    return "-";
  }
  return unit ? `${quantity} ${unit}` : quantity;
};

/**
 * 統計表示向けに数値文字列を整形する。
 */
const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "-";
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  const fixed = value.toFixed(2);
  return fixed.replace(TRAILING_DECIMAL_ZERO_PATTERN, "");
};

/**
 * 現在連続日数を算出する。
 */
const resolveCurrentStreak = (positiveDates: Set<string>): number => {
  let streak = 0;
  const currentDate = getTodayDate();

  while (positiveDates.has(formatDate(currentDate))) {
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

/**
 * 最長連続日数を算出する。
 */
const resolveLongestStreak = (positiveDates: Set<string>): number => {
  const sortedDates = [...positiveDates].sort();
  if (sortedDates.length === 0) {
    return 0;
  }

  let longestStreak = 1;
  let currentStreak = 1;

  for (let index = 1; index < sortedDates.length; index += 1) {
    const previousDate = parseYyyyMmDd(sortedDates[index - 1]);
    const currentDate = parseYyyyMmDd(sortedDates[index]);

    if (!(previousDate && currentDate)) {
      currentStreak = 1;
      continue;
    }

    const differenceInDays =
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);

    if (differenceInDays === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  return longestStreak;
};

/**
 * 端末現在日付を時刻ゼロで返す。
 */
const getTodayDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * `yyyyMMdd` 形式へ正規化する。
 */
const formatDate = (date: Date): string => {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

/**
 * `yyyyMMdd` 文字列をDateへ変換する。
 */
const parseYyyyMmDd = (value: string): Date | null => {
  if (!YYYY_MM_DD_PATTERN.test(value)) {
    return null;
  }
  const year = Number(value.slice(0, 4));
  const monthIndex = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  const parsed = new Date(year, monthIndex, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== monthIndex ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
};
