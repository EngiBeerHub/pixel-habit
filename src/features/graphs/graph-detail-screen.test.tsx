import { notifyManager } from "@tanstack/query-core";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import type { ReactElement, ReactNode } from "react";
import {
  headerActionTokens,
  menuIconTokens,
} from "../../shared/config/ui-tokens";
import { renderWithProviders } from "../../test-utils/render-with-providers";
import { GraphDetailScreen } from "./graph-detail-screen";

const mockGetPixels = jest.fn();
const mockDeleteGraph = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockCanGoBack = jest.fn();
const mockOpenDialog = jest.fn();
let mockAppOwnership: "expo" | null = null;
const SHORT_RANGE_LABEL_PATTERN = /^2025\/11\/09 - 2026\/02\/14$/;
const OPTIONAL_DATA_PREVIEW_PATTERN =
  /^これは とても 長い 補足メモで 一覧では 省略…$/;
let mockRouteParams: {
  color?: string;
  graphId?: string;
  graphName?: string;
  timezone?: string;
  unit?: string;
} = {
  color: "sora",
  graphId: "sleep",
  graphName: "Sleep",
  timezone: "Asia/Tokyo",
  unit: "hour",
};

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockRouteParams,
  useNavigation: () => ({
    canGoBack: mockCanGoBack,
    setOptions: mockSetOptions,
  }),
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock("../../shared/api/graph", () => ({
  deleteGraph: (...args: unknown[]) => mockDeleteGraph(...args),
}));

jest.mock("../../shared/api/pixel", () => ({
  getPixels: (...args: unknown[]) => mockGetPixels(...args),
}));

jest.mock("../../shared/storage/auth-storage", () => ({
  loadAuthCredentials: (...args: unknown[]) => mockLoadAuthCredentials(...args),
}));

jest.mock("../../shared/ui/app-dialog-provider", () => ({
  useAppDialog: () => ({
    open: (...args: unknown[]) => mockOpenDialog(...args),
  }),
}));

jest.mock("@react-native-menu/menu", () => ({
  MenuView: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    get appOwnership() {
      return mockAppOwnership;
    },
  },
}));

jest.mock("heroui-native", () => {
  const { Pressable, Text, View } = require("react-native");

  const Tabs = ({ children }: { children?: ReactNode }) => (
    <View>{children}</View>
  );
  Tabs.List = ({ children }: { children?: ReactNode }) => (
    <View>{children}</View>
  );
  Tabs.Indicator = () => null;
  Tabs.Trigger = ({
    children,
    onPress,
    testID,
    value,
  }: {
    children?: ReactNode;
    onPress?: () => void;
    testID?: string;
    value?: string;
  }) => (
    <Pressable
      onPress={() => {
        onPress?.();
      }}
      testID={testID}
    >
      <Text>{value}</Text>
      {children}
    </Pressable>
  );
  Tabs.Label = ({ children }: { children?: ReactNode }) => (
    <Text>{children}</Text>
  );
  Tabs.Content = () => null;

  return {
    Button: ({
      children,
      onPress,
      testID,
    }: {
      children?: ReactNode;
      onPress?: () => void;
      testID?: string;
    }) => (
      <Pressable onPress={onPress} testID={testID}>
        <Text>{children}</Text>
      </Pressable>
    ),
    Card: Object.assign(
      ({ children }: { children?: ReactNode }) => <View>{children}</View>,
      {
        Body: ({ children }: { children?: ReactNode }) => (
          <View>{children}</View>
        ),
        Header: ({ children }: { children?: ReactNode }) => (
          <View>{children}</View>
        ),
        Title: ({ children }: { children?: ReactNode }) => (
          <Text>{children}</Text>
        ),
      }
    ),
    Tabs,
  };
});

const credentials = {
  token: "token-1234",
  username: "demo-user",
};

const renderScreen = () => {
  return renderWithProviders(<GraphDetailScreen />, {
    withAuthSession: true,
  });
};

const getHeaderRightElement = () => {
  const optionsWithHeaderRight = [...mockSetOptions.mock.calls]
    .map((call) => call[0] as { headerRight?: unknown })
    .reverse()
    .find((options) => typeof options.headerRight === "function") as
    | {
        headerRight?: (props: { tintColor?: string }) => ReactNode;
      }
    | undefined;

  if (!optionsWithHeaderRight?.headerRight) {
    throw new Error("headerRight is not configured");
  }

  return optionsWithHeaderRight.headerRight({
    tintColor: "#111827",
  }) as ReactElement<{
    actions?: Array<{ id?: string; title: string }>;
    children?: ReactElement<{
      accessibilityLabel?: string;
      accessibilityRole?: string;
      accessible?: boolean;
      children?: ReactElement<{ color?: string; name?: string; size?: number }>;
      className?: string;
    }>;
    isAnchoredToRight?: boolean;
    onPress?: () => void;
    onPressAction?: (event: { nativeEvent: { event: string } }) => void;
    testID?: string;
  }>;
};

const pressHeaderMenuAction = (actionId: string) => {
  const headerRightElement = getHeaderRightElement();
  act(() => {
    headerRightElement.props.onPressAction?.({
      nativeEvent: {
        event: actionId,
      },
    });
  });
};

describe("GraphDetailScreen", () => {
  beforeAll(() => {
    notifyManager.setNotifyFunction((callback) => {
      act(() => {
        callback();
      });
    });
  });

  afterAll(() => {
    notifyManager.setNotifyFunction((callback) => {
      callback();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 14, 12, 0, 0));
    mockCanGoBack.mockReturnValue(true);
    mockAppOwnership = null;
    mockRouteParams = {
      color: "sora",
      graphId: "sleep",
      graphName: "Sleep",
      timezone: "Asia/Tokyo",
      unit: "hour",
    };
    mockLoadAuthCredentials.mockResolvedValue(credentials);
    mockGetPixels.mockResolvedValue([
      {
        date: "20260213",
        optionalData:
          "これは\nとても\n長い\n補足メモで\n一覧では\n省略表示される想定です",
        quantity: "2",
      },
      { date: "20260211", quantity: "4" },
      { date: "20260210", quantity: "0" },
    ]);
    mockDeleteGraph.mockResolvedValue({
      isSuccess: true,
      message: "削除成功",
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("loads short range by default", async () => {
    renderScreen();

    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Sleep",
        })
      );
    });
    expect(await screen.findByText(SHORT_RANGE_LABEL_PATTERN)).toBeTruthy();
    expect(screen.queryByText("表示範囲")).toBeNull();
    expect(screen.queryByText("Short=14週 / Full=53週")).toBeNull();

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledWith({
        from: "20251109",
        graphId: "sleep",
        to: "20260214",
      });
    });
  });

  test("switches to full range", async () => {
    renderScreen();
    fireEvent.press(await screen.findByTestId("graph-detail-mode-full"));

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledWith({
        from: "20250209",
        graphId: "sleep",
        to: "20260214",
      });
    });
  });

  test("shows kpi chips", async () => {
    renderScreen();

    expect(await screen.findByTestId("graph-detail-kpi-record")).toBeTruthy();
    expect(await screen.findByTestId("graph-detail-kpi-total")).toBeTruthy();
    expect(await screen.findByTestId("graph-detail-kpi-average")).toBeTruthy();
    expect(await screen.findByTestId("graph-detail-kpi-today")).toBeTruthy();
    expect(
      await screen.findByTestId("graph-detail-kpi-record-icon")
    ).toBeTruthy();
    expect(
      await screen.findByTestId("graph-detail-kpi-total-icon")
    ).toBeTruthy();
    expect(
      await screen.findByTestId("graph-detail-kpi-average-icon")
    ).toBeTruthy();
    expect(
      await screen.findByTestId("graph-detail-kpi-today-icon")
    ).toBeTruthy();
    expect(await screen.findByTestId("graph-detail-stats")).toBeTruthy();
    expect(await screen.findByTestId("graph-detail-info")).toBeTruthy();
    expect(await screen.findByTestId("graph-detail-meta-block")).toBeTruthy();
    expect(await screen.findByTestId("graph-detail-record-list")).toBeTruthy();
    expect(screen.queryByText("統計")).toBeNull();
    expect(screen.getByText("ハイライト")).toBeTruthy();
    expect(screen.getByText("グラフ情報")).toBeTruthy();
    expect(screen.getByText("最近の記録")).toBeTruthy();
  });

  test("does not open quick add when heatmap cell is tapped", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    fireEvent.press(await screen.findByTestId("compact-heatmap-cell-20260213"));

    expect(mockPush).not.toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/graphs/[graphId]/pixels/[date]",
      })
    );
  });

  test("navigates to pixel detail when tapping a record row", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    fireEvent.press(await screen.findByTestId("graph-detail-record-20260213"));

    expect(mockPush).toHaveBeenCalledWith({
      params: {
        date: "20260213",
        graphId: "sleep",
        graphName: "Sleep",
        optionalData:
          "これは\nとても\n長い\n補足メモで\n一覧では\n省略表示される想定です",
        quantity: "2",
      },
      pathname: "/graphs/[graphId]/pixels/[date]",
    });
  });

  test("shows memo summary only when optionalData exists", async () => {
    renderScreen();

    expect(
      await screen.findByTestId("graph-detail-record-memo-20260213")
    ).toBeTruthy();
    expect(screen.getByText(OPTIONAL_DATA_PREVIEW_PATTERN)).toBeTruthy();
    expect(
      screen.queryByTestId("graph-detail-record-memo-20260211")
    ).toBeNull();
  });

  test("shows error and allows retry", async () => {
    mockGetPixels.mockRejectedValueOnce(new Error("取得失敗"));

    renderScreen();

    expect(await screen.findByText("取得失敗")).toBeTruthy();
    fireEvent.press(screen.getByTestId("graph-detail-retry"));

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledTimes(2);
    });
  });

  test("opens graph management menu from ellipsis button", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    const headerRightElement = getHeaderRightElement();

    expect(headerRightElement.props.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          imageColor: menuIconTokens.primaryColor,
          id: "edit",
          title: "編集",
        }),
        expect.objectContaining({
          imageColor: menuIconTokens.destructiveColor,
          id: "delete",
          title: "削除",
        }),
      ])
    );
    expect(headerRightElement.props.isAnchoredToRight).toBe(true);
    expect(headerRightElement.props.testID).toBe(
      "graph-detail-header-menu-button"
    );

    const headerTriggerContainer = headerRightElement.props
      .children as ReactElement<{
      accessibilityLabel?: string;
      accessibilityRole?: string;
      accessible?: boolean;
      children?: ReactElement<{ color?: string; name?: string; size?: number }>;
      className?: string;
    }>;
    expect(headerTriggerContainer.props.className).toBe(
      headerActionTokens.iconButtonClass
    );
    expect(headerTriggerContainer.props.accessibilityLabel).toBe(
      "グラフ操作メニュー"
    );
    expect(headerTriggerContainer.props.accessibilityRole).toBe("button");
    expect(headerTriggerContainer.props.accessible).toBe(true);

    const headerIcon = headerTriggerContainer.props.children;
    if (!headerIcon) {
      throw new Error("header icon is not configured");
    }
    expect(headerIcon.props.name).toBe("ellipsis-horizontal");
    expect(headerIcon.props.size).toBe(headerActionTokens.iconSize);
  });

  test("navigates to edit screen from graph management menu", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    pressHeaderMenuAction("edit");

    expect(mockPush).toHaveBeenCalledWith({
      params: {
        color: "sora",
        graphId: "sleep",
        graphName: "Sleep",
        timezone: "Asia/Tokyo",
        unit: "hour",
      },
      pathname: "/graphs/[graphId]/edit",
    });
  });

  test("deletes graph from menu and navigates back when possible", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    pressHeaderMenuAction("delete");

    expect(mockOpenDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Sleep を削除しますか？この操作は取り消せません。",
        title: "グラフ削除",
      })
    );

    const confirmDialogActions = mockOpenDialog.mock.calls[0]?.[0]?.actions as
      | Array<{ label: string; onPress?: () => void }>
      | undefined;
    const deleteAction = confirmDialogActions?.find(
      (action) => action.label === "削除する"
    );

    act(() => {
      deleteAction?.onPress?.();
    });

    await waitFor(() => {
      expect(mockDeleteGraph).toHaveBeenCalledWith({ graphId: "sleep" });
    });

    expect(mockOpenDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "削除成功",
        title: "削除完了",
      })
    );

    const completionDialogActions = mockOpenDialog.mock.calls[1]?.[0]
      ?.actions as Array<{ label: string; onPress?: () => void }>;
    const okAction = completionDialogActions.find(
      (action) => action.label === "OK"
    );

    act(() => {
      okAction?.onPress?.();
    });

    expect(mockBack).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test("replaces home tab after delete completion when back is unavailable", async () => {
    mockCanGoBack.mockReturnValue(false);
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    pressHeaderMenuAction("delete");

    const confirmDialogActions = mockOpenDialog.mock.calls[0]?.[0]?.actions as
      | Array<{ label: string; onPress?: () => void }>
      | undefined;
    const deleteAction = confirmDialogActions?.find(
      (action) => action.label === "削除する"
    );
    act(() => {
      deleteAction?.onPress?.();
    });

    await waitFor(() => {
      expect(mockDeleteGraph).toHaveBeenCalledWith({ graphId: "sleep" });
    });

    const completionDialogActions = mockOpenDialog.mock.calls[1]?.[0]
      ?.actions as Array<{ label: string; onPress?: () => void }>;
    const okAction = completionDialogActions.find(
      (action) => action.label === "OK"
    );
    act(() => {
      okAction?.onPress?.();
    });

    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
  });

  test("opens fallback dialog menu when native menu is unavailable", async () => {
    mockAppOwnership = "expo";
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    const headerRightElement = getHeaderRightElement();
    act(() => {
      headerRightElement.props.onPress?.();
    });

    expect(mockOpenDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "グラフ操作",
      })
    );

    const fallbackActions = mockOpenDialog.mock.calls[0]?.[0]?.actions as
      | Array<{ label: string; onPress?: () => void }>
      | undefined;
    const editAction = fallbackActions?.find(
      (action) => action.label === "編集"
    );
    const deleteAction = fallbackActions?.find(
      (action) => action.label === "削除"
    );

    act(() => {
      editAction?.onPress?.();
    });
    expect(mockPush).toHaveBeenCalledWith({
      params: {
        color: "sora",
        graphId: "sleep",
        graphName: "Sleep",
        timezone: "Asia/Tokyo",
        unit: "hour",
      },
      pathname: "/graphs/[graphId]/edit",
    });

    act(() => {
      deleteAction?.onPress?.();
    });
    expect(mockOpenDialog).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: "グラフ削除",
      })
    );
  });
});
