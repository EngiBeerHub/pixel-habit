import { notifyManager } from "@tanstack/query-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { AuthSessionProvider } from "../../shared/auth/auth-session-context";
import { GraphDetailScreen } from "./graph-detail-screen";

const mockGetPixels = jest.fn();
const mockDeleteGraph = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockShowAlert = jest.fn();
const MONTH_RANGE_LABEL_PATTERN = /2026年2月: 20260201 - 20260228/;
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
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useLocalSearchParams: () => mockRouteParams,
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

jest.mock("../../shared/platform/app-alert", () => ({
  showAlert: (...args: unknown[]) => mockShowAlert(...args),
}));

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
      { date: "20260213", quantity: "2" },
      { date: "20260211", quantity: "4" },
      { date: "20260210", quantity: "0" },
    ]);
    mockDeleteGraph.mockResolvedValue({
      isSuccess: true,
      message: "削除成功",
    });
    mockShowAlert.mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("loads month range by default", async () => {
    renderScreen();

    expect(await screen.findByText("Sleep")).toBeTruthy();
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
    await screen.findByText("Sleep");
    expect(screen.getByText("Month=暦月 / Year=暦年")).toBeTruthy();

    fireEvent.press(screen.getByTestId("graph-detail-mode-year"));

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledWith({
        from: "20260101",
        graphId: "sleep",
        to: "20261231",
      });
    });
  });

  test("shows light summary", async () => {
    renderScreen();

    expect(await screen.findByText("合計: 6")).toBeTruthy();
    expect(await screen.findByText("記録日数: 2")).toBeTruthy();
    expect(await screen.findByText("最大値: 4")).toBeTruthy();
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

  test("shows graphId invalid message", async () => {
    mockRouteParams = {
      color: "sora",
      graphName: "Sleep",
      timezone: "Asia/Tokyo",
      unit: "hour",
    };

    renderScreen();

    expect(
      await screen.findByText(
        "グラフIDが不正です。Home画面からやり直してください。"
      )
    ).toBeTruthy();
  });

  test("navigates to edit screen from menu", async () => {
    renderScreen();
    await screen.findByText("Sleep");

    fireEvent.press(screen.getByTestId("graph-detail-menu-button"));
    expect(mockShowAlert).toHaveBeenCalledWith(
      "Sleep",
      "操作を選択してください。",
      expect.any(Array)
    );

    const menuButtons = mockShowAlert.mock.calls[0]?.[2] as
      | Array<{ onPress?: () => void; text?: string }>
      | undefined;
    const editButton = menuButtons?.find((button) => button.text === "編集");

    act(() => {
      editButton?.onPress?.();
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
  });

  test("deletes graph from menu and redirects home", async () => {
    renderScreen();
    await screen.findByText("Sleep");

    fireEvent.press(screen.getByTestId("graph-detail-menu-button"));
    const menuButtons = mockShowAlert.mock.calls[0]?.[2] as
      | Array<{ onPress?: () => void; text?: string }>
      | undefined;
    const deleteButton = menuButtons?.find((button) => button.text === "削除");

    act(() => {
      deleteButton?.onPress?.();
    });

    expect(mockShowAlert).toHaveBeenCalledWith(
      "グラフ削除",
      "Sleep を削除しますか？この操作は取り消せません。",
      expect.any(Array)
    );
    const confirmButtons = mockShowAlert.mock.calls[1]?.[2] as
      | Array<{ onPress?: () => void; text?: string }>
      | undefined;
    const confirmDeleteButton = confirmButtons?.find(
      (button) => button.text === "削除する"
    );

    act(() => {
      confirmDeleteButton?.onPress?.();
    });

    await waitFor(() => {
      expect(mockDeleteGraph).toHaveBeenCalledWith({ graphId: "sleep" });
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
    });
  });
});
