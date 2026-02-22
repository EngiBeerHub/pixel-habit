import { notifyManager } from "@tanstack/query-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { ReactNode } from "react";
import { AuthSessionProvider } from "../../shared/auth/auth-session-context";
import { GraphDetailScreen } from "./graph-detail-screen";

const mockGetPixels = jest.fn();
const mockDeleteGraph = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSetOptions = jest.fn();
const mockOpenDialog = jest.fn();
const MONTH_RANGE_LABEL_PATTERN = /2026年2月: 20260201 - 20260228/;
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
    setOptions: mockSetOptions,
  }),
  useRouter: () => ({
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
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        gcTime: Number.POSITIVE_INFINITY,
      },
      queries: {
        gcTime: Number.POSITIVE_INFINITY,
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <GraphDetailScreen />
      </AuthSessionProvider>
    </QueryClientProvider>
  );
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

  test("loads month range by default", async () => {
    renderScreen();

    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Sleep",
        })
      );
    });
    expect(await screen.findByTestId("graph-detail-mode-help")).toBeTruthy();
    expect(await screen.findByText(MONTH_RANGE_LABEL_PATTERN)).toBeTruthy();

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledWith({
        from: "20260201",
        graphId: "sleep",
        to: "20260228",
      });
    });
  });

  test("switches to year range", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    fireEvent.press(screen.getByTestId("graph-detail-mode-year"));

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledWith({
        from: "20260101",
        graphId: "sleep",
        to: "20261231",
      });
    });
  });

  test("shows expanded summary", async () => {
    renderScreen();

    expect(await screen.findByText("合計: 6")).toBeTruthy();
    expect(await screen.findByText("記録日数: 2")).toBeTruthy();
    expect(await screen.findByText("最大: 4")).toBeTruthy();
    expect(await screen.findByText("平均(記録日): 3")).toBeTruthy();
    expect(await screen.findByText("現在連続日数: 0")).toBeTruthy();
    expect(await screen.findByText("最長連続日数: 1")).toBeTruthy();
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

  test("navigates to edit screen from edit icon", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    fireEvent.press(screen.getByTestId("graph-detail-edit-button"));

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

  test("deletes graph from delete icon and redirects home", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    fireEvent.press(screen.getByTestId("graph-detail-delete-button"));
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

    expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
  });
});
